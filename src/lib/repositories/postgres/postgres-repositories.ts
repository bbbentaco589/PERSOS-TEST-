import type { Kysely, Selectable } from "kysely";

import {
  getDatabaseClient,
  type DiscussionTable,
  type PssDatabase,
  type PssDatabaseClient,
  type SourceTable,
} from "@/lib/database";
import { updateHumanReviewStatus } from "@/lib/discussion-engine/review-workflow";
import { prepareDiscussionFlowForStorage } from "@/lib/repositories/discussion-flow-storage";
import type {
  AIResponsesRepository,
  CharactersRepository,
  ConsensusRepository,
  ContentDraftsRepository,
  CrossRebuttalsRepository,
  DiscussionPersistenceRepository,
  DiscussionsRepository,
  KnowledgeEntriesRepository,
  OrganizationRepository,
  SaveDiscussionFlowOptions,
  SourcesRepository,
  TopicsRepository,
  UpdateDiscussionReviewStatusInput,
} from "@/lib/repositories/interfaces";
import type { DiscussionEngineFlowPayload, StoredDiscussionFlow } from "@/types/api";
import type {
  AIResponse,
  Consensus,
  Discussion,
  DiscussionParticipant,
  KnowledgeEntry,
  Source,
} from "@/types";
import {
  mapAIResponse,
  mapCharacter,
  mapCompany,
  mapConsensus,
  mapContentDraft,
  mapCrossRebuttal,
  mapDiscussion,
  mapDivision,
  mapEmployeeShowcase,
  mapKnowledgeEntry,
  mapPublishedContent,
  mapSource,
  mapTeam,
  mapTopic,
} from "./postgres-mappers";

export type PostgresDatabaseProvider = () => PssDatabaseClient;

abstract class PostgresRepositoryBase {
  constructor(private readonly databaseProvider: PostgresDatabaseProvider = getDatabaseClient) {}

  protected get db() {
    return this.databaseProvider();
  }
}

async function loadTopicIdsBySource(
  db: Kysely<PssDatabase>,
  sourceIds: string[]
) {
  const result = new Map<string, string[]>();
  sourceIds.forEach((sourceId) => result.set(sourceId, []));

  if (sourceIds.length === 0) return result;

  const rows = await db.selectFrom("topic_sources")
    .select(["source_id", "topic_id"])
    .where("source_id", "in", sourceIds)
    .orderBy("created_at", "asc")
    .execute();

  rows.forEach((row) => result.get(row.source_id)?.push(row.topic_id));
  return result;
}

async function loadSourcesByRows(
  db: Kysely<PssDatabase>,
  rows: Selectable<SourceTable>[]
): Promise<Source[]> {
  const topicIds = await loadTopicIdsBySource(db, rows.map((row) => row.id));
  return rows.map((row) => mapSource(row, topicIds.get(row.id) ?? []));
}

async function loadAIResponsesForDiscussion(
  db: Kysely<PssDatabase>,
  discussionId: string
): Promise<AIResponse[]> {
  const rows = await db.selectFrom("ai_responses")
    .selectAll()
    .where("discussion_id", "=", discussionId)
    .orderBy("created_at", "asc")
    .orderBy("id", "asc")
    .execute();
  if (rows.length === 0) return [];

  const links = await db.selectFrom("ai_response_sources")
    .select(["response_id", "source_id"])
    .where("response_id", "in", rows.map((row) => row.id))
    .orderBy("order_index", "asc")
    .execute();
  const sourcesByResponse = new Map<string, string[]>();
  links.forEach((link) => {
    const values = sourcesByResponse.get(link.response_id) ?? [];
    values.push(link.source_id);
    sourcesByResponse.set(link.response_id, values);
  });

  return rows.map((row) => mapAIResponse(row, sourcesByResponse.get(row.id) ?? []));
}

async function loadConsensusForDiscussion(
  db: Kysely<PssDatabase>,
  discussionId: string
): Promise<Consensus | undefined> {
  const row = await db.selectFrom("consensuses")
    .selectAll()
    .where("discussion_id", "=", discussionId)
    .executeTakeFirst();
  if (!row) return undefined;

  const links = await db.selectFrom("consensus_sources")
    .select("source_id")
    .where("consensus_id", "=", row.id)
    .orderBy("order_index", "asc")
    .execute();
  return mapConsensus(row, links.map((link) => link.source_id));
}

async function reconstructDiscussion(
  db: Kysely<PssDatabase>,
  row: Selectable<DiscussionTable>
): Promise<Discussion> {
  const [participantRows, sourceRows, responseRows, rebuttalRows, consensusRow] = await Promise.all([
    db.selectFrom("discussion_participants").selectAll()
      .where("discussion_id", "=", row.id).orderBy("order_index", "asc").execute(),
    db.selectFrom("discussion_sources").select("source_id")
      .where("discussion_id", "=", row.id).orderBy("order_index", "asc").execute(),
    db.selectFrom("ai_responses").select("id")
      .where("discussion_id", "=", row.id).orderBy("created_at", "asc").orderBy("id", "asc").execute(),
    db.selectFrom("cross_rebuttals").select("id")
      .where("discussion_id", "=", row.id).orderBy("created_at", "asc").orderBy("id", "asc").execute(),
    db.selectFrom("consensuses").select("id").where("discussion_id", "=", row.id).executeTakeFirst(),
  ]);
  const participants: DiscussionParticipant[] = participantRows.map((participant) => ({
    characterId: participant.character_id,
    departmentId: participant.department_id as DiscussionParticipant["departmentId"],
    role: participant.role as DiscussionParticipant["role"],
    order: participant.order_index,
  }));

  return mapDiscussion(
    row,
    participants,
    sourceRows.map((item) => item.source_id),
    responseRows.map((item) => item.id),
    rebuttalRows.map((item) => item.id),
    consensusRow?.id
  );
}

async function reconstructStoredFlow(
  db: Kysely<PssDatabase>,
  discussionId: string
): Promise<StoredDiscussionFlow | undefined> {
  const row = await db.selectFrom("discussions").selectAll()
    .where("id", "=", discussionId).where("origin", "=", "generated").executeTakeFirst();
  if (!row) return undefined;

  const discussion = await reconstructDiscussion(db, row);
  const [topicRow, sourceRows, responses, rebuttalRows, consensus, draftRow, characterRows] = await Promise.all([
    db.selectFrom("topics").selectAll().where("id", "=", discussion.topicId).executeTakeFirst(),
    discussion.sourceIds.length
      ? db.selectFrom("sources").selectAll().where("id", "in", discussion.sourceIds).execute()
      : Promise.resolve([]),
    loadAIResponsesForDiscussion(db, discussionId),
    db.selectFrom("cross_rebuttals").selectAll().where("discussion_id", "=", discussionId)
      .orderBy("created_at", "asc").orderBy("id", "asc").execute(),
    loadConsensusForDiscussion(db, discussionId),
    db.selectFrom("content_drafts").selectAll().where("discussion_id", "=", discussionId)
      .orderBy("created_at", "asc").executeTakeFirst(),
    discussion.participants.length
      ? db.selectFrom("characters").selectAll()
          .where("id", "in", discussion.participants.map((item) => item.characterId)).execute()
      : Promise.resolve([]),
  ]);
  if (!topicRow) throw new Error(`저장된 토론의 Topic을 찾을 수 없습니다: ${discussion.topicId}`);

  const sourcesById = new Map((await loadSourcesByRows(db, sourceRows)).map((source) => [source.id, source]));
  const charactersById = new Map(characterRows.map((character) => [character.id, mapCharacter(character)]));

  return {
    topicId: discussion.topicId,
    discussion,
    topic: mapTopic(topicRow),
    sources: discussion.sourceIds.flatMap((id) => sourcesById.get(id) ?? []),
    characters: discussion.participants.flatMap((item) => charactersById.get(item.characterId) ?? []),
    responses,
    rebuttals: rebuttalRows.map(mapCrossRebuttal),
    consensus: consensus ?? null,
    contentDraft: draftRow ? mapContentDraft(draftRow) : null,
    isGenerated: true,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

export class PostgresCharactersRepository extends PostgresRepositoryBase implements CharactersRepository {
  async listCharacters() {
    return (await this.db.selectFrom("characters").selectAll().orderBy("id").execute()).map(mapCharacter);
  }
  async getCharacterById(characterId: string) {
    const row = await this.db.selectFrom("characters").selectAll().where("id", "=", characterId).executeTakeFirst();
    return row ? mapCharacter(row) : undefined;
  }
  async getCharacterBySlug(slug: string) {
    const row = await this.db.selectFrom("characters").selectAll().where("slug", "=", slug).executeTakeFirst();
    return row ? mapCharacter(row) : undefined;
  }
  async getCharactersByDepartmentId(departmentId: string) {
    return (await this.db.selectFrom("characters").selectAll().where("department_id", "=", departmentId).orderBy("id").execute()).map(mapCharacter);
  }
}

export class PostgresOrganizationRepository extends PostgresRepositoryBase implements OrganizationRepository {
  async listCompanies() { return (await this.db.selectFrom("companies").selectAll().orderBy("id").execute()).map(mapCompany); }
  async getCompanyById(id: string) { const row = await this.db.selectFrom("companies").selectAll().where("id", "=", id).executeTakeFirst(); return row ? mapCompany(row) : undefined; }
  async listDivisions() { return (await this.db.selectFrom("divisions").selectAll().orderBy("display_order").execute()).map(mapDivision); }
  async getDivisionById(id: string) { const row = await this.db.selectFrom("divisions").selectAll().where("id", "=", id).executeTakeFirst(); return row ? mapDivision(row) : undefined; }
  async getDivisionBySlug(slug: string) { const row = await this.db.selectFrom("divisions").selectAll().where("slug", "=", slug).executeTakeFirst(); return row ? mapDivision(row) : undefined; }
  async getDivisionsByCompanyId(id: string) { return (await this.db.selectFrom("divisions").selectAll().where("company_id", "=", id).orderBy("display_order").execute()).map(mapDivision); }
  async listTeams() { return (await this.db.selectFrom("teams").selectAll().orderBy("division_id").orderBy("display_order").execute()).map(mapTeam); }
  async getTeamById(id: string) { const row = await this.db.selectFrom("teams").selectAll().where("id", "=", id).executeTakeFirst(); return row ? mapTeam(row) : undefined; }
  async getTeamBySlug(slug: string) { const row = await this.db.selectFrom("teams").selectAll().where("slug", "=", slug).executeTakeFirst(); return row ? mapTeam(row) : undefined; }
  async getTeamsByDivisionId(id: string) { return (await this.db.selectFrom("teams").selectAll().where("division_id", "=", id).orderBy("display_order").execute()).map(mapTeam); }
  async listEmployees() { return (await this.db.selectFrom("characters").selectAll().orderBy("id").execute()).map(mapCharacter); }
  async getEmployeeById(id: string) { const row = await this.db.selectFrom("characters").selectAll().where("id", "=", id).executeTakeFirst(); return row ? mapCharacter(row) : undefined; }
  async getEmployeeBySlug(slug: string) { const row = await this.db.selectFrom("characters").selectAll().where("slug", "=", slug).executeTakeFirst(); return row ? mapCharacter(row) : undefined; }
  async getEmployeesByDivisionId(id: string) { return (await this.db.selectFrom("characters").selectAll().where("division_id", "=", id).orderBy("id").execute()).map(mapCharacter); }
  async getEmployeesByTeamId(id: string) { return (await this.db.selectFrom("characters").selectAll().where("team_id", "=", id).orderBy("id").execute()).map(mapCharacter); }
  async listEmployeeShowcases() { return (await this.db.selectFrom("employee_showcases").selectAll().orderBy("id").execute()).map(mapEmployeeShowcase); }
  async getEmployeeShowcaseByEmployeeId(id: string) { const row = await this.db.selectFrom("employee_showcases").selectAll().where("employee_id", "=", id).executeTakeFirst(); return row ? mapEmployeeShowcase(row) : undefined; }
}

export class PostgresTopicsRepository extends PostgresRepositoryBase implements TopicsRepository {
  async listTopics() { return (await this.db.selectFrom("topics").selectAll().orderBy("created_at").orderBy("id").execute()).map(mapTopic); }
  async getTopicById(id: string) { const row = await this.db.selectFrom("topics").selectAll().where("id", "=", id).executeTakeFirst(); return row ? mapTopic(row) : undefined; }
  async getTopicBySlug(slug: string) { const row = await this.db.selectFrom("topics").selectAll().where("slug", "=", slug).executeTakeFirst(); return row ? mapTopic(row) : undefined; }
}

export class PostgresSourcesRepository extends PostgresRepositoryBase implements SourcesRepository {
  async listSources() { return loadSourcesByRows(this.db, await this.db.selectFrom("sources").selectAll().orderBy("id").execute()); }
  async getSourceById(id: string) { const rows = await this.db.selectFrom("sources").selectAll().where("id", "=", id).execute(); return (await loadSourcesByRows(this.db, rows))[0]; }
  async getSourcesByTopicId(topicId: string) {
    const rows = await this.db.selectFrom("sources").innerJoin("topic_sources", "topic_sources.source_id", "sources.id")
      .selectAll("sources").where("topic_sources.topic_id", "=", topicId).orderBy("topic_sources.created_at").execute();
    return loadSourcesByRows(this.db, rows);
  }
  async getSourcesByIds(ids: string[]) {
    if (ids.length === 0) return [];
    const values = await loadSourcesByRows(this.db, await this.db.selectFrom("sources").selectAll().where("id", "in", ids).execute());
    const byId = new Map(values.map((item) => [item.id, item]));
    return ids.flatMap((id) => byId.get(id) ?? []);
  }
}

export class PostgresDiscussionsRepository extends PostgresRepositoryBase implements DiscussionsRepository {
  private async listRows(rows: Selectable<DiscussionTable>[]) { return Promise.all(rows.map((row) => reconstructDiscussion(this.db, row))); }
  async listDiscussions() { return this.listRows(await this.db.selectFrom("discussions").selectAll().where("origin", "=", "seeded").orderBy("created_at").orderBy("id").execute()); }
  async getDiscussionById(id: string) { const row = await this.db.selectFrom("discussions").selectAll().where("id", "=", id).executeTakeFirst(); return row ? reconstructDiscussion(this.db, row) : undefined; }
  async getDiscussionBySlug(slug: string) { const row = await this.db.selectFrom("discussions").selectAll().where("slug", "=", slug).orderBy("created_at", "desc").executeTakeFirst(); return row ? reconstructDiscussion(this.db, row) : undefined; }
  async getDiscussionsByTopicId(id: string) { return this.listRows(await this.db.selectFrom("discussions").selectAll().where("topic_id", "=", id).orderBy("created_at").orderBy("id").execute()); }
}

export class PostgresAIResponsesRepository extends PostgresRepositoryBase implements AIResponsesRepository {
  async listAIResponses() {
    const discussions = await this.db.selectFrom("discussions").select("id").where("origin", "=", "seeded").orderBy("created_at").execute();
    return (await Promise.all(discussions.map((row) => loadAIResponsesForDiscussion(this.db, row.id)))).flat();
  }
  async getResponsesByDiscussionId(id: string) { return loadAIResponsesForDiscussion(this.db, id); }
}

export class PostgresCrossRebuttalsRepository extends PostgresRepositoryBase implements CrossRebuttalsRepository {
  async listCrossRebuttals() { return (await this.db.selectFrom("cross_rebuttals").selectAll().orderBy("created_at").orderBy("id").execute()).map(mapCrossRebuttal); }
  async getCrossRebuttalsByDiscussionId(id: string) { return (await this.db.selectFrom("cross_rebuttals").selectAll().where("discussion_id", "=", id).orderBy("created_at").orderBy("id").execute()).map(mapCrossRebuttal); }
}

export class PostgresConsensusRepository extends PostgresRepositoryBase implements ConsensusRepository {
  async listConsensus() {
    const rows = await this.db.selectFrom("consensuses").select("discussion_id").orderBy("created_at").execute();
    return (await Promise.all(rows.map((row) => loadConsensusForDiscussion(this.db, row.discussion_id)))).filter((item): item is Consensus => Boolean(item));
  }
  async getConsensusByDiscussionId(id: string) { return loadConsensusForDiscussion(this.db, id); }
}

export class PostgresContentDraftsRepository extends PostgresRepositoryBase implements ContentDraftsRepository {
  async listContentDrafts() {
    const rows = await this.db.selectFrom("content_drafts").innerJoin("discussions", "discussions.id", "content_drafts.discussion_id")
      .selectAll("content_drafts").where("discussions.origin", "=", "seeded").orderBy("content_drafts.created_at").execute();
    return rows.map(mapContentDraft);
  }
  async getContentDraftById(id: string) { const row = await this.db.selectFrom("content_drafts").selectAll().where("id", "=", id).executeTakeFirst(); return row ? mapContentDraft(row) : undefined; }
  async getContentDraftsByDiscussionId(id: string) { return (await this.db.selectFrom("content_drafts").selectAll().where("discussion_id", "=", id).orderBy("created_at").execute()).map(mapContentDraft); }
  async listPublishedContent() { return (await this.db.selectFrom("content_drafts").selectAll().where("status", "=", "Published").where("published_at", "is not", null).orderBy("published_at", "desc").execute()).flatMap((row) => mapPublishedContent(row) ?? []); }
  async getPublishedContentBySlug(slug: string) { const row = await this.db.selectFrom("content_drafts").selectAll().where("slug", "=", slug).where("status", "=", "Published").where("published_at", "is not", null).orderBy("published_at", "desc").executeTakeFirst(); return row ? mapPublishedContent(row) : undefined; }
}

export class PostgresKnowledgeEntriesRepository extends PostgresRepositoryBase implements KnowledgeEntriesRepository {
  private async mapRows(rows: Selectable<PssDatabase["knowledge_entries"]>[]): Promise<KnowledgeEntry[]> {
    if (rows.length === 0) return [];
    const links = await this.db.selectFrom("knowledge_entry_sources").select(["knowledge_entry_id", "source_id"])
      .where("knowledge_entry_id", "in", rows.map((row) => row.id)).orderBy("order_index").execute();
    const sourceIds = new Map<string, string[]>();
    links.forEach((link) => { const values = sourceIds.get(link.knowledge_entry_id) ?? []; values.push(link.source_id); sourceIds.set(link.knowledge_entry_id, values); });
    return rows.map((row) => mapKnowledgeEntry(row, sourceIds.get(row.id) ?? []));
  }
  async listKnowledgeEntries() { return this.mapRows(await this.db.selectFrom("knowledge_entries").selectAll().orderBy("id").execute()); }
  async getKnowledgeEntryById(id: string) { return (await this.mapRows(await this.db.selectFrom("knowledge_entries").selectAll().where("id", "=", id).execute()))[0]; }
  async getKnowledgeEntriesBySourceId(id: string) { const rows = await this.db.selectFrom("knowledge_entries").innerJoin("knowledge_entry_sources", "knowledge_entry_sources.knowledge_entry_id", "knowledge_entries.id").selectAll("knowledge_entries").where("knowledge_entry_sources.source_id", "=", id).orderBy("knowledge_entry_sources.order_index").execute(); return this.mapRows(rows); }
}

async function deleteAggregateChildren(db: Kysely<PssDatabase>, discussionId: string) {
  await db.deleteFrom("content_drafts").where("discussion_id", "=", discussionId).execute();
  await db.deleteFrom("consensuses").where("discussion_id", "=", discussionId).execute();
  await db.deleteFrom("cross_rebuttals").where("discussion_id", "=", discussionId).execute();
  await db.deleteFrom("ai_responses").where("discussion_id", "=", discussionId).execute();
  await db.deleteFrom("discussion_participants").where("discussion_id", "=", discussionId).execute();
  await db.deleteFrom("discussion_sources").where("discussion_id", "=", discussionId).execute();
}

async function writeDiscussionFlow(
  db: Kysely<PssDatabase>,
  flow: DiscussionEngineFlowPayload,
  existingCreatedAt?: string
) {
  const now = new Date().toISOString();
  await db.insertInto("discussions").values({
    id: flow.discussion.id, slug: flow.discussion.slug, topic_id: flow.discussion.topicId,
    title: flow.discussion.title, kicker: flow.discussion.kicker, summary: flow.discussion.summary,
    status: flow.discussion.status, mode: flow.discussion.mode, reading_time: flow.discussion.readingTime,
    published_at: flow.discussion.publishedAt ?? null, origin: "generated",
    created_at: existingCreatedAt ?? flow.discussion.createdAt, updated_at: now,
  }).onConflict((conflict) => conflict.column("id").doUpdateSet({
    slug: flow.discussion.slug, title: flow.discussion.title, kicker: flow.discussion.kicker,
    summary: flow.discussion.summary, status: flow.discussion.status, mode: flow.discussion.mode,
    reading_time: flow.discussion.readingTime, published_at: flow.discussion.publishedAt ?? null,
    updated_at: now,
  })).execute();

  await deleteAggregateChildren(db, flow.discussion.id);
  if (flow.sources.length) await db.insertInto("discussion_sources").values(flow.sources.map((source, index) => ({ discussion_id: flow.discussion.id, source_id: source.id, order_index: index }))).execute();
  if (flow.discussion.participants.length) await db.insertInto("discussion_participants").values(flow.discussion.participants.map((participant) => ({ id: `${flow.discussion.id}:${participant.characterId}`, discussion_id: flow.discussion.id, character_id: participant.characterId, department_id: participant.departmentId, role: participant.role, order_index: participant.order }))).execute();
  if (flow.responses.length) {
    await db.insertInto("ai_responses").values(flow.responses.map((response) => ({ id: response.id, discussion_id: flow.discussion.id, character_id: response.characterId, round: response.round, stance: response.stance, content: response.content, confidence: response.confidence, created_at: response.createdAt }))).execute();
    const links = flow.responses.flatMap((response) => response.sourceIds.map((sourceId, index) => ({ response_id: response.id, source_id: sourceId, order_index: index })));
    if (links.length) await db.insertInto("ai_response_sources").values(links).execute();
  }
  if (flow.rebuttals.length) await db.insertInto("cross_rebuttals").values(flow.rebuttals.map((item) => ({ id: item.id, discussion_id: flow.discussion.id, from_character_id: item.fromCharacterId, target_response_id: item.targetResponseId, content: item.content, created_at: item.createdAt }))).execute();
  if (flow.consensus) {
    await db.insertInto("consensuses").values({ id: flow.consensus.id, discussion_id: flow.discussion.id, summary: flow.consensus.summary, key_agreements: flow.consensus.keyAgreements, open_questions: flow.consensus.openQuestions, disagreements: flow.consensus.disagreements, confidence: flow.consensus.confidence, risk_level: flow.consensus.riskLevel, created_at: flow.consensus.createdAt }).execute();
    if (flow.consensus.sourceIds.length) await db.insertInto("consensus_sources").values(flow.consensus.sourceIds.map((sourceId, index) => ({ consensus_id: flow.consensus!.id, source_id: sourceId, order_index: index }))).execute();
  }
  if (flow.contentDraft) await db.insertInto("content_drafts").values({ id: flow.contentDraft.id, discussion_id: flow.discussion.id, consensus_id: flow.contentDraft.consensusId, title: flow.contentDraft.title, slug: flow.contentDraft.slug, format: flow.contentDraft.format, excerpt: flow.contentDraft.excerpt, body: flow.contentDraft.body, status: flow.contentDraft.status, target_channels: flow.contentDraft.targetChannels, published_at: null, public_url: null, created_at: flow.contentDraft.createdAt, updated_at: flow.contentDraft.updatedAt }).execute();
}

export class PostgresDiscussionPersistenceRepository extends PostgresRepositoryBase implements DiscussionPersistenceRepository {
  async listGeneratedDiscussions() {
    const rows = await this.db.selectFrom("discussions").selectAll().where("origin", "=", "generated").orderBy("created_at").orderBy("id").execute();
    return Promise.all(rows.map((row) => reconstructDiscussion(this.db, row)));
  }
  async listGeneratedDiscussionFlows() {
    const rows = await this.db.selectFrom("discussions").select("id").where("origin", "=", "generated").orderBy("created_at").orderBy("id").execute();
    return (await Promise.all(rows.map((row) => reconstructStoredFlow(this.db, row.id)))).filter((flow): flow is StoredDiscussionFlow => Boolean(flow));
  }
  async getGeneratedDiscussionFlowById(id: string) { return reconstructStoredFlow(this.db, id); }
  async saveDiscussionFlow(flow: DiscussionEngineFlowPayload, options?: SaveDiscussionFlowOptions) {
    const prepared = prepareDiscussionFlowForStorage(flow, options?.assignNewId);
    const existing = await this.db.selectFrom("discussions").select("created_at").where("id", "=", prepared.discussion.id).executeTakeFirst();
    await this.db.transaction().execute(async (transaction) => {
      await writeDiscussionFlow(transaction, prepared, existing?.created_at instanceof Date ? existing.created_at.toISOString() : existing?.created_at);
    });
    const stored = await reconstructStoredFlow(this.db, prepared.discussion.id);
    if (!stored) throw new Error(`저장한 Discussion Flow를 재조회하지 못했습니다: ${prepared.discussion.id}`);
    return stored;
  }
  async updateReviewStatus(input: UpdateDiscussionReviewStatusInput) {
    const existing = await reconstructStoredFlow(this.db, input.discussionId);
    if (!existing?.contentDraft) return null;
    const timestamp = new Date().toISOString();
    const updated = {
      ...updateHumanReviewStatus(input.contentDraft, input.status),
      updatedAt: timestamp,
    };
    await this.db.transaction().execute(async (transaction) => {
      await transaction.updateTable("content_drafts").set({
        status: updated.status,
        updated_at: timestamp,
        published_at: updated.status === "Published" ? timestamp : null,
        public_url: updated.status === "Published" ? `/discussion/${updated.slug}` : null,
      }).where("id", "=", updated.id).where("discussion_id", "=", input.discussionId).execute();
      await transaction.updateTable("discussions").set({
        status: updated.status,
        published_at: updated.status === "Published" ? timestamp : existing.discussion.publishedAt ?? null,
        updated_at: timestamp,
      }).where("id", "=", input.discussionId).where("origin", "=", "generated").execute();
    });
    return reconstructStoredFlow(this.db, input.discussionId).then((flow) => flow ?? null);
  }
  async deleteGeneratedDiscussion(id: string) {
    const published = await this.db.selectFrom("content_drafts").select("id").where("discussion_id", "=", id).where("status", "=", "Published").executeTakeFirst();
    if (published) return false;
    const result = await this.db.deleteFrom("discussions").where("id", "=", id).where("origin", "=", "generated").executeTakeFirst();
    return Number(result.numDeletedRows) > 0;
  }
  async clearGeneratedDiscussions() {
    await this.db.deleteFrom("discussions").where("origin", "=", "generated").where("id", "not in", (query) => query.selectFrom("content_drafts").select("discussion_id").where("status", "=", "Published")).execute();
  }
}
