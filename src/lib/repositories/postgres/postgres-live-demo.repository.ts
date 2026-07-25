import type { LiveDemoRepository } from "@/lib/repositories/interfaces";
import type {
  LiveDemoContentPlan,
  LiveDemoGeneratedContent,
  LiveDemoGenerationRun,
  LiveDemoRepositoryFilter,
  LiveDemoState,
  LiveDemoUsageLog,
} from "@/types";
import type { PssDatabaseClient } from "@/lib/database";
import type {
  LiveDemoGeneratedContentTable,
  LiveDemoStateTable,
  LiveDemoUsageLogTable,
} from "@/lib/database";
import type { Selectable } from "kysely";

export type LiveDemoDatabaseProvider = () => PssDatabaseClient;

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function mapContent(
  row: Selectable<LiveDemoGeneratedContentTable>
): LiveDemoGeneratedContent {
  return {
    id: row.id,
    planId: row.plan_id,
    contentType: row.content_type,
    personaId: row.persona_id,
    topicId: row.topic_id,
    title: row.title,
    sourceBody: row.source_body,
    publicBody: row.public_body,
    status: row.status,
    activityType: row.activity_type ?? undefined,
    stance: row.stance ?? undefined,
    round: row.round ?? undefined,
    replyToId: row.reply_to_id ?? undefined,
    metadata: parseJson(row.metadata),
    scheduledAt: row.scheduled_at ? toIso(row.scheduled_at) : undefined,
    createdAt: toIso(row.created_at),
    publishedAt: row.published_at ? toIso(row.published_at) : undefined,
    failureReason: row.failure_reason ?? undefined,
  };
}

function mapUsage(
  row: Selectable<LiveDemoUsageLogTable>
): LiveDemoUsageLog {
  return {
    id: row.id,
    runId: row.run_id,
    provider: row.provider,
    model: row.model,
    promptTokens: row.prompt_tokens,
    outputTokens: row.output_tokens,
    totalTokens: row.total_tokens,
    latencyMs: row.latency_ms,
    success: row.success,
    errorCode: row.error_code ?? undefined,
    createdAt: toIso(row.created_at),
  };
}

function mapState(row: Selectable<LiveDemoStateTable>): LiveDemoState {
  return {
    id: row.id,
    killSwitch: row.kill_switch,
    totalCalls: row.total_calls,
    chatRuns: row.chat_runs,
    chatMessages: row.chat_messages,
    feedPosts: row.feed_posts,
    debateMessages: row.debate_messages,
    updatedAt: toIso(row.updated_at),
  };
}

export class PostgresLiveDemoRepository implements LiveDemoRepository {
  constructor(private readonly databaseProvider: LiveDemoDatabaseProvider) {}

  async getActivePlan() {
    const row = await this.databaseProvider()
      .selectFrom("live_demo_plans")
      .selectAll()
      .where("status", "=", "active")
      .executeTakeFirst();
    return row ? parseJson<LiveDemoContentPlan>(row.plan_json) : undefined;
  }

  async savePlan(plan: LiveDemoContentPlan) {
    await this.databaseProvider()
      .insertInto("live_demo_plans")
      .values({
        id: plan.id,
        status: plan.status,
        plan_json: plan,
        starts_at: plan.startsAt,
        ends_at: plan.endsAt,
        created_by_persona_id: plan.createdByPersonaId,
        created_at: plan.createdAt,
        updated_at: plan.updatedAt,
      })
      .onConflict((conflict) =>
        conflict.column("id").doUpdateSet({
          status: plan.status,
          plan_json: plan,
          starts_at: plan.startsAt,
          ends_at: plan.endsAt,
          updated_at: plan.updatedAt,
        })
      )
      .execute();
    return plan;
  }

  async listGeneratedContents(filter: LiveDemoRepositoryFilter = {}) {
    let query = this.databaseProvider()
      .selectFrom("live_demo_generated_contents")
      .selectAll();
    if (filter.contentType) {
      query = query.where("content_type", "=", filter.contentType);
    }
    if (filter.status) {
      query = query.where("status", "=", filter.status);
    }
    let ordered = query.orderBy("created_at", "desc");
    if (typeof filter.limit === "number") {
      ordered = ordered.limit(filter.limit);
    }
    return (await ordered.execute()).map(mapContent);
  }

  async getGeneratedContentById(contentId: string) {
    const row = await this.databaseProvider()
      .selectFrom("live_demo_generated_contents")
      .selectAll()
      .where("id", "=", contentId)
      .executeTakeFirst();
    return row ? mapContent(row) : undefined;
  }

  async saveGeneratedContent(content: LiveDemoGeneratedContent) {
    await this.databaseProvider()
      .insertInto("live_demo_generated_contents")
      .values({
        id: content.id,
        plan_id: content.planId,
        content_type: content.contentType,
        persona_id: content.personaId,
        topic_id: content.topicId,
        title: content.title,
        source_body: content.sourceBody,
        public_body: content.publicBody,
        status: content.status,
        activity_type: content.activityType ?? null,
        stance: content.stance ?? null,
        round: content.round ?? null,
        reply_to_id: content.replyToId ?? null,
        metadata: content.metadata,
        scheduled_at: content.scheduledAt ?? null,
        created_at: content.createdAt,
        published_at: content.publishedAt ?? null,
        failure_reason: content.failureReason ?? null,
      })
      .execute();
    return content;
  }

  async updateGeneratedContent(content: LiveDemoGeneratedContent) {
    await this.databaseProvider()
      .updateTable("live_demo_generated_contents")
      .set({
        title: content.title,
        source_body: content.sourceBody,
        public_body: content.publicBody,
        status: content.status,
        activity_type: content.activityType ?? null,
        stance: content.stance ?? null,
        round: content.round ?? null,
        reply_to_id: content.replyToId ?? null,
        metadata: content.metadata,
        scheduled_at: content.scheduledAt ?? null,
        published_at: content.publishedAt ?? null,
        failure_reason: content.failureReason ?? null,
      })
      .where("id", "=", content.id)
      .execute();
    return content;
  }

  async createGenerationRun(run: LiveDemoGenerationRun) {
    await this.databaseProvider()
      .insertInto("live_demo_generation_runs")
      .values({
        id: run.id,
        plan_id: run.planId ?? null,
        trigger: run.trigger,
        content_type: run.contentType,
        status: run.status,
        attempt: run.attempt,
        started_at: run.startedAt,
        finished_at: run.finishedAt ?? null,
        failure_reason: run.failureReason ?? null,
        metadata: run.metadata,
      })
      .execute();
    return run;
  }

  async updateGenerationRun(run: LiveDemoGenerationRun) {
    await this.databaseProvider()
      .updateTable("live_demo_generation_runs")
      .set({
        plan_id: run.planId ?? null,
        status: run.status,
        attempt: run.attempt,
        finished_at: run.finishedAt ?? null,
        failure_reason: run.failureReason ?? null,
        metadata: run.metadata,
      })
      .where("id", "=", run.id)
      .execute();
    return run;
  }

  async saveUsageLog(log: LiveDemoUsageLog) {
    await this.databaseProvider()
      .insertInto("live_demo_usage_logs")
      .values({
        id: log.id,
        run_id: log.runId,
        provider: log.provider,
        model: log.model,
        prompt_tokens: log.promptTokens,
        output_tokens: log.outputTokens,
        total_tokens: log.totalTokens,
        latency_ms: log.latencyMs,
        success: log.success,
        error_code: log.errorCode ?? null,
        created_at: log.createdAt,
      })
      .execute();
    return log;
  }

  async listUsageLogs() {
    return (
      await this.databaseProvider()
        .selectFrom("live_demo_usage_logs")
        .selectAll()
        .orderBy("created_at", "desc")
        .execute()
    ).map(mapUsage);
  }

  async getState() {
    const row = await this.databaseProvider()
      .selectFrom("live_demo_state")
      .selectAll()
      .where("id", "=", "investor-live-demo")
      .executeTakeFirstOrThrow();
    return mapState(row);
  }

  async setKillSwitch(enabled: boolean) {
    const row = await this.databaseProvider()
      .updateTable("live_demo_state")
      .set({ kill_switch: enabled, updated_at: new Date().toISOString() })
      .where("id", "=", "investor-live-demo")
      .returningAll()
      .executeTakeFirstOrThrow();
    return mapState(row);
  }

  async reserveGenerationCall(maxTotalCalls: number) {
    return this.databaseProvider()
      .transaction()
      .execute(async (transaction) => {
        const current = await transaction
          .selectFrom("live_demo_state")
          .selectAll()
          .where("id", "=", "investor-live-demo")
          .forUpdate()
          .executeTakeFirstOrThrow();
        if (current.kill_switch || current.total_calls >= maxTotalCalls) {
          return null;
        }
        const updated = await transaction
          .updateTable("live_demo_state")
          .set({
            total_calls: current.total_calls + 1,
            updated_at: new Date().toISOString(),
          })
          .where("id", "=", "investor-live-demo")
          .returningAll()
          .executeTakeFirstOrThrow();
        return mapState(updated);
      });
  }

  async incrementCounters(
    delta: Parameters<LiveDemoRepository["incrementCounters"]>[0]
  ) {
    const db = this.databaseProvider();
    return db.transaction().execute(async (transaction) => {
      const current = await transaction
        .selectFrom("live_demo_state")
        .selectAll()
        .where("id", "=", "investor-live-demo")
        .forUpdate()
        .executeTakeFirstOrThrow();
      const updated = await transaction
        .updateTable("live_demo_state")
        .set({
          chat_runs: current.chat_runs + (delta.chatRuns ?? 0),
          chat_messages: current.chat_messages + (delta.chatMessages ?? 0),
          feed_posts: current.feed_posts + (delta.feedPosts ?? 0),
          debate_messages:
            current.debate_messages + (delta.debateMessages ?? 0),
          updated_at: new Date().toISOString(),
        })
        .where("id", "=", "investor-live-demo")
        .returningAll()
        .executeTakeFirstOrThrow();
      return mapState(updated);
    });
  }
}
