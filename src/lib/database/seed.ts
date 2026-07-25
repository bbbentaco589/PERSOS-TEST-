import type { Kysely } from "kysely";

import {
  aiResponses,
  characters,
  companies,
  consensuses,
  contentDrafts,
  crossRebuttals,
  departments,
  discussions,
  divisions,
  employeeShowcases,
  knowledgeEntries,
  publishedContents,
  sources,
  teams,
  topics,
} from "@/data";
import type { PssDatabase } from "./types";

export async function seedCoreMvpDatabase(db: Kysely<PssDatabase>) {
  await db.transaction().execute(async (transaction) => {
    await transaction.insertInto("companies").values(companies.map((item) => ({
      id: item.id, slug: item.slug, name_ko: item.nameKo, name_en: item.nameEn,
      description: item.description, description_ko: item.descriptionKo,
      description_en: item.descriptionEn, division_ids: item.divisionIds, status: item.status,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("departments").values(departments.map((item) => ({
      id: item.id, name: item.name, mandate: item.mandate, signal: item.signal,
      roles: item.roles, operating_mode: item.operatingMode, accent: item.accent,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("divisions").values(divisions.map((item) => ({
      id: item.id, company_id: item.companyId, slug: item.slug, name_ko: item.nameKo,
      name_en: item.nameEn, description: item.description, description_ko: item.descriptionKo,
      description_en: item.descriptionEn, icon: item.icon, display_order: item.displayOrder,
      status: item.status, organization_type: item.organizationType,
      team_ids: item.teamIds, department_ids: item.departmentIds,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("teams").values(teams.map((item) => ({
      id: item.id, division_id: item.divisionId, slug: item.slug, name_ko: item.nameKo,
      name_en: item.nameEn, description_ko: item.descriptionKo,
      description_en: item.descriptionEn, display_order: item.displayOrder, status: item.status,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("characters").values(characters.map((item) => ({
      id: item.id, slug: item.slug, name: item.name, name_ko: item.nameKo, name_en: item.nameEn,
      division_id: item.divisionId, team_id: item.teamId, department_id: item.departmentId,
      job_title: item.jobTitle, job_title_ko: item.jobTitleKo, job_title_en: item.jobTitleEn,
      hook: item.hook, hook_ko: item.hookKo, hook_en: item.hookEn,
      summary: item.summary, summary_ko: item.summaryKo, summary_en: item.summaryEn,
      personality: item.personality, values: item.values, strengths: item.strengths,
      specialties: item.specialties, specialties_ko: item.specialtiesKo,
      specialties_en: item.specialtiesEn, weakness: item.weakness, stance: item.stance,
      content_role: item.contentRole, confidence: item.confidence, status: item.status,
      brand_color: item.brandColor, profile_image: item.profileImage, hero_image: item.heroImage,
      social_links: item.socialLinks,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("employee_showcases").values(employeeShowcases.map((item) => ({
      id: item.id, employee_id: item.employeeId, profile: item.profile,
      specialties: item.specialties, recent_discussion_ids: item.recentDiscussionIds,
      knowledge_entry_ids: item.knowledgeEntryIds, published_content_ids: item.publishedContentIds,
      media: item.media, archive: item.archive, timeline: item.timeline, updated_at: item.updatedAt,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("topics").values(topics.map((item) => ({
      id: item.id, slug: item.slug, title: item.title, description: item.description,
      source_hint: item.sourceHint, status: item.status, priority: item.priority,
      risk_level: item.riskLevel, compliance_categories: item.complianceCategories,
      created_at: item.createdAt,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("sources").values(sources.map((item) => ({
      id: item.id, name: item.name, type: item.type, trust_level: item.trustLevel,
      risk_level: item.riskLevel, compliance_categories: item.complianceCategories,
      usage: item.usage, summary: item.summary, url: item.url ?? null,
      publisher: item.publisher ?? null, last_reviewed: item.lastReviewed,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    const topicSourceRows = sources.flatMap((source) =>
      source.topicIds.map((topicId) => ({ topic_id: topicId, source_id: source.id }))
    );
    await transaction.insertInto("topic_sources").values(topicSourceRows)
      .onConflict((conflict) => conflict.columns(["topic_id", "source_id"]).doNothing()).execute();

    await transaction.insertInto("discussions").values(discussions.map((item) => ({
      id: item.id, slug: item.slug, topic_id: item.topicId, title: item.title,
      kicker: item.kicker, summary: item.summary, status: item.status, mode: item.mode,
      reading_time: item.readingTime, published_at: item.publishedAt ?? null,
      origin: "seeded" as const, created_at: item.createdAt,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    const discussionSources = discussions.flatMap((discussion) =>
      discussion.sourceIds.map((sourceId, index) => ({
        discussion_id: discussion.id, source_id: sourceId, order_index: index,
      }))
    );
    await transaction.insertInto("discussion_sources").values(discussionSources)
      .onConflict((conflict) => conflict.columns(["discussion_id", "source_id"]).doNothing()).execute();

    const participants = discussions.flatMap((discussion) =>
      discussion.participants.map((participant) => ({
        id: `${discussion.id}:${participant.characterId}`, discussion_id: discussion.id,
        character_id: participant.characterId, department_id: participant.departmentId,
        role: participant.role, order_index: participant.order,
      }))
    );
    await transaction.insertInto("discussion_participants").values(participants)
      .onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("ai_responses").values(aiResponses.map((item) => ({
      id: item.id, discussion_id: item.discussionId, character_id: item.characterId,
      round: item.round, stance: item.stance, content: item.content,
      confidence: item.confidence, created_at: item.createdAt,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();
    const responseSources = aiResponses.flatMap((response) =>
      response.sourceIds.map((sourceId, index) => ({
        response_id: response.id, source_id: sourceId, order_index: index,
      }))
    );
    await transaction.insertInto("ai_response_sources").values(responseSources)
      .onConflict((conflict) => conflict.columns(["response_id", "source_id"]).doNothing()).execute();

    await transaction.insertInto("cross_rebuttals").values(crossRebuttals.map((item) => ({
      id: item.id, discussion_id: item.discussionId, from_character_id: item.fromCharacterId,
      target_response_id: item.targetResponseId, content: item.content, created_at: item.createdAt,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("consensuses").values(consensuses.map((item) => ({
      id: item.id, discussion_id: item.discussionId, summary: item.summary,
      key_agreements: item.keyAgreements, open_questions: item.openQuestions,
      disagreements: item.disagreements, confidence: item.confidence,
      risk_level: item.riskLevel, created_at: item.createdAt,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();
    const consensusSources = consensuses.flatMap((consensus) =>
      consensus.sourceIds.map((sourceId, index) => ({
        consensus_id: consensus.id, source_id: sourceId, order_index: index,
      }))
    );
    await transaction.insertInto("consensus_sources").values(consensusSources)
      .onConflict((conflict) => conflict.columns(["consensus_id", "source_id"]).doNothing()).execute();

    const publishedById = new Map(publishedContents.map((item) => [item.id, item]));
    await transaction.insertInto("content_drafts").values(contentDrafts.map((item) => {
      const published = publishedById.get(item.id);
      return {
        id: item.id, discussion_id: item.discussionId, consensus_id: item.consensusId,
        title: item.title, slug: item.slug, format: item.format, excerpt: item.excerpt,
        body: item.body, status: item.status, target_channels: item.targetChannels,
        published_at: published?.publishedAt ?? null, public_url: published?.publicUrl ?? null,
        created_at: item.createdAt, updated_at: item.updatedAt,
      };
    })).onConflict((conflict) => conflict.column("id").doNothing()).execute();

    await transaction.insertInto("knowledge_entries").values(knowledgeEntries.map((item) => ({
      id: item.id, title: item.title, category: item.category, source_type: item.sourceType,
      confidence: item.confidence, last_reviewed: item.lastReviewed, summary: item.summary,
    }))).onConflict((conflict) => conflict.column("id").doNothing()).execute();
    const knowledgeSources = knowledgeEntries.flatMap((entry) =>
      entry.relatedSourceIds.map((sourceId, index) => ({
        knowledge_entry_id: entry.id, source_id: sourceId, order_index: index,
      }))
    );
    await transaction.insertInto("knowledge_entry_sources").values(knowledgeSources)
      .onConflict((conflict) => conflict.columns(["knowledge_entry_id", "source_id"]).doNothing()).execute();
  });
}
