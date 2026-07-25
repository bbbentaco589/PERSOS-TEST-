import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    create table live_demo_plans (
      id text primary key,
      status text not null check (status in ('active','completed','cancelled')),
      plan_json jsonb not null,
      starts_at timestamptz not null,
      ends_at timestamptz not null,
      created_by_persona_id text not null references characters(id) on delete restrict,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table live_demo_generated_contents (
      id text primary key,
      plan_id text references live_demo_plans(id) on delete cascade,
      content_type text not null check (content_type in ('feed','debate','anonymous')),
      persona_id text not null references characters(id) on delete restrict,
      topic_id text not null,
      title text not null,
      source_body text not null,
      public_body text not null,
      status text not null check (status in ('generating','draft','qa_passed','published','qa_rejected','failed','limit_reached')),
      activity_type text,
      stance text check (stance in ('support','oppose','neutral')),
      round text check (round in ('opening','rebuttal','summary')),
      reply_to_id text references live_demo_generated_contents(id) on delete set null,
      metadata jsonb not null default '{}'::jsonb,
      scheduled_at timestamptz,
      created_at timestamptz not null default now(),
      published_at timestamptz,
      failure_reason text
    );

    create table live_demo_generation_runs (
      id text primary key,
      plan_id text not null references live_demo_plans(id) on delete cascade,
      trigger text not null check (trigger in ('runner','manual','api')),
      content_type text not null check (content_type in ('feed','debate','anonymous','plan')),
      status text not null check (status in ('generating','draft','qa_passed','published','qa_rejected','failed','limit_reached')),
      attempt integer not null default 0,
      started_at timestamptz not null default now(),
      finished_at timestamptz,
      failure_reason text,
      metadata jsonb not null default '{}'::jsonb
    );

    create table live_demo_usage_logs (
      id text primary key,
      run_id text not null references live_demo_generation_runs(id) on delete cascade,
      provider text not null check (provider = 'gemini'),
      model text not null,
      prompt_tokens integer not null default 0,
      output_tokens integer not null default 0,
      total_tokens integer not null default 0,
      latency_ms integer not null default 0,
      success boolean not null,
      error_code text,
      created_at timestamptz not null default now()
    );

    create table live_demo_state (
      id text primary key check (id = 'investor-live-demo'),
      kill_switch boolean not null default false,
      total_calls integer not null default 0,
      chat_runs integer not null default 0,
      chat_messages integer not null default 0,
      feed_posts integer not null default 0,
      debate_messages integer not null default 0,
      updated_at timestamptz not null default now()
    );

    insert into live_demo_state (id) values ('investor-live-demo')
    on conflict (id) do nothing;

    create unique index live_demo_one_active_plan_idx
      on live_demo_plans ((status)) where status = 'active';
    create index live_demo_contents_public_idx
      on live_demo_generated_contents (content_type, status, published_at desc);
    create index live_demo_runs_started_idx
      on live_demo_generation_runs (started_at desc);
    create index live_demo_usage_created_idx
      on live_demo_usage_logs (created_at desc);
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    drop table if exists live_demo_usage_logs;
    drop table if exists live_demo_generation_runs;
    drop table if exists live_demo_generated_contents;
    drop table if exists live_demo_plans;
    drop table if exists live_demo_state;
  `.execute(db);
}
