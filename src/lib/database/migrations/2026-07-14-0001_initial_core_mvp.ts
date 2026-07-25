import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    create table companies (
      id text primary key, slug text not null unique, name_ko text not null, name_en text not null,
      description text not null, description_ko text not null, description_en text not null,
      division_ids jsonb not null default '[]'::jsonb,
      status text not null check (status in ('Planning','Active','Paused','Archived')),
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table departments (
      id text primary key, name text not null unique, mandate text not null, signal text not null,
      roles jsonb not null default '[]'::jsonb, operating_mode text not null, accent text not null,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table divisions (
      id text primary key, company_id text not null references companies(id) on delete restrict,
      slug text not null unique, name_ko text not null, name_en text not null,
      description text not null, description_ko text not null, description_en text not null,
      icon text not null, display_order integer not null,
      status text not null check (status in ('Planning','Active','Paused','Archived')),
      department_ids jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table characters (
      id text primary key, slug text not null unique, name text not null, name_ko text not null, name_en text not null,
      division_id text not null references divisions(id) on delete restrict,
      department_id text not null references departments(id) on delete restrict,
      job_title text not null, job_title_ko text not null, job_title_en text not null,
      hook text not null, hook_ko text not null, hook_en text not null,
      summary text not null, summary_ko text not null, summary_en text not null,
      personality text not null, values jsonb not null default '[]'::jsonb,
      strengths jsonb not null default '[]'::jsonb, specialties jsonb not null default '[]'::jsonb,
      specialties_ko jsonb not null default '[]'::jsonb, specialties_en jsonb not null default '[]'::jsonb,
      weakness text not null, stance text not null, content_role text not null,
      confidence text not null check (confidence in ('Exploratory','Balanced','High')),
      status text not null check (status in ('MVP Candidate','Active','Draft','On Leave','Archived')),
      brand_color text not null, profile_image text not null, hero_image text not null,
      social_links jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table employee_showcases (
      id text primary key, employee_id text not null unique references characters(id) on delete cascade,
      profile jsonb not null, specialties jsonb not null default '[]'::jsonb,
      recent_discussion_ids jsonb not null default '[]'::jsonb,
      knowledge_entry_ids jsonb not null default '[]'::jsonb,
      published_content_ids jsonb not null default '[]'::jsonb,
      media jsonb not null default '[]'::jsonb, archive jsonb not null default '[]'::jsonb,
      timeline jsonb not null default '[]'::jsonb, updated_at timestamptz not null default now()
    );
    create table topics (
      id text primary key, slug text not null unique, title text not null, description text not null,
      source_hint text not null,
      status text not null check (status in ('Queued','In Discussion','Ready for Review')),
      priority text not null check (priority in ('Low','Medium','High')),
      risk_level text not null check (risk_level in ('Low','Medium','High','Restricted')),
      compliance_categories jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table sources (
      id text primary key, name text not null,
      type text not null check (type in ('Internal Document','External Primary','Market Data','News','Social Signal','Reference')),
      trust_level text not null check (trust_level in ('Primary','Secondary','Context')),
      risk_level text not null check (risk_level in ('Low','Medium','High','Restricted')),
      compliance_categories jsonb not null default '[]'::jsonb,
      usage text not null, summary text not null, url text, publisher text, last_reviewed date not null,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table topic_sources (
      topic_id text not null references topics(id) on delete cascade,
      source_id text not null references sources(id) on delete restrict,
      created_at timestamptz not null default now(), primary key (topic_id, source_id)
    );
    create table discussions (
      id text primary key, slug text not null, topic_id text not null references topics(id) on delete restrict,
      title text not null, kicker text not null, summary text not null,
      status text not null check (status in ('Draft','Source Attached','AI Generated','Pending Review','Approved','Published','Archived','Rejected','Needs Revision')),
      mode text not null check (mode in ('Round Table','Department Review','Editorial Memo')),
      reading_time text not null default 'Draft', published_at timestamptz,
      origin text not null default 'generated' check (origin in ('seeded','generated')),
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table discussion_sources (
      discussion_id text not null references discussions(id) on delete cascade,
      source_id text not null references sources(id) on delete restrict,
      order_index integer not null default 0, created_at timestamptz not null default now(),
      primary key (discussion_id, source_id)
    );
    create table discussion_participants (
      id text primary key, discussion_id text not null references discussions(id) on delete cascade,
      character_id text not null references characters(id) on delete restrict,
      department_id text not null references departments(id) on delete restrict,
      role text not null check (role in ('Lead','Reviewer','Challenger','Moderator')),
      order_index integer not null, created_at timestamptz not null default now(),
      unique (discussion_id, character_id)
    );
    create table ai_responses (
      id text primary key, discussion_id text not null references discussions(id) on delete cascade,
      character_id text not null references characters(id) on delete restrict,
      round text not null check (round in ('Opening','Cross Rebuttal','Final Position')),
      stance text not null, content text not null,
      confidence text not null check (confidence in ('Low','Medium','High')),
      created_at timestamptz not null default now()
    );
    create table ai_response_sources (
      response_id text not null references ai_responses(id) on delete cascade,
      source_id text not null references sources(id) on delete restrict,
      order_index integer not null default 0, created_at timestamptz not null default now(),
      primary key (response_id, source_id)
    );
    create table cross_rebuttals (
      id text primary key, discussion_id text not null references discussions(id) on delete cascade,
      from_character_id text not null references characters(id) on delete restrict,
      target_response_id text not null references ai_responses(id) on delete cascade,
      content text not null, created_at timestamptz not null default now()
    );
    create table consensuses (
      id text primary key, discussion_id text not null unique references discussions(id) on delete cascade,
      summary text not null, key_agreements jsonb not null default '[]'::jsonb,
      open_questions jsonb not null default '[]'::jsonb, disagreements jsonb not null default '[]'::jsonb,
      confidence text not null check (confidence in ('Low','Medium','High')),
      risk_level text not null check (risk_level in ('Low','Medium','High','Restricted')),
      created_at timestamptz not null default now()
    );
    create table consensus_sources (
      consensus_id text not null references consensuses(id) on delete cascade,
      source_id text not null references sources(id) on delete restrict,
      order_index integer not null default 0, created_at timestamptz not null default now(),
      primary key (consensus_id, source_id)
    );
    create table content_drafts (
      id text primary key, discussion_id text not null references discussions(id) on delete cascade,
      consensus_id text not null references consensuses(id) on delete cascade,
      title text not null, slug text not null,
      format text not null check (format in ('Web Article','YouTube Script','Short-form Script','Social Post','Internal Memo')),
      excerpt text not null, body text not null,
      status text not null check (status in ('Draft','AI Generated','Pending Review','Approved','Published','Archived','Rejected','Needs Revision')),
      target_channels jsonb not null default '[]'::jsonb, published_at timestamptz, public_url text,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table knowledge_entries (
      id text primary key, title text not null, category text not null, source_type text not null,
      confidence text not null check (confidence in ('Low','Medium','High')),
      last_reviewed date not null, summary text not null,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table knowledge_entry_sources (
      knowledge_entry_id text not null references knowledge_entries(id) on delete cascade,
      source_id text not null references sources(id) on delete restrict,
      order_index integer not null default 0, created_at timestamptz not null default now(),
      primary key (knowledge_entry_id, source_id)
    );

    create index divisions_company_order_idx on divisions(company_id, display_order);
    create index characters_department_idx on characters(department_id);
    create index characters_division_idx on characters(division_id);
    create index topics_status_idx on topics(status);
    create index topic_sources_source_idx on topic_sources(source_id);
    create index discussions_slug_idx on discussions(slug);
    create index discussions_topic_created_idx on discussions(topic_id, created_at);
    create index discussions_origin_created_idx on discussions(origin, created_at);
    create index discussion_sources_order_idx on discussion_sources(discussion_id, order_index);
    create index discussion_participants_order_idx on discussion_participants(discussion_id, order_index);
    create index ai_responses_discussion_created_idx on ai_responses(discussion_id, created_at, id);
    create index cross_rebuttals_discussion_created_idx on cross_rebuttals(discussion_id, created_at, id);
    create index content_drafts_discussion_idx on content_drafts(discussion_id);
    create index content_drafts_status_created_idx on content_drafts(status, created_at);
    create index knowledge_entry_sources_source_idx on knowledge_entry_sources(source_id);
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    drop table if exists knowledge_entry_sources;
    drop table if exists knowledge_entries;
    drop table if exists content_drafts;
    drop table if exists consensus_sources;
    drop table if exists consensuses;
    drop table if exists cross_rebuttals;
    drop table if exists ai_response_sources;
    drop table if exists ai_responses;
    drop table if exists discussion_participants;
    drop table if exists discussion_sources;
    drop table if exists discussions;
    drop table if exists topic_sources;
    drop table if exists sources;
    drop table if exists topics;
    drop table if exists employee_showcases;
    drop table if exists characters;
    drop table if exists divisions;
    drop table if exists departments;
    drop table if exists companies;
  `.execute(db);
}
