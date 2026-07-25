import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    alter table divisions add column organization_type text not null default 'Division';
    alter table divisions add column team_ids jsonb not null default '[]'::jsonb;

    update divisions set slug = 'community-business', name_ko = '커뮤니티사업부', name_en = 'Community Business Division',
      description = 'Operates communities, member care, and participation programs.',
      description_ko = '커뮤니티 케어와 참여 운영을 통해 이용자 관계와 활동 기반을 만듭니다.',
      description_en = 'Operates communities, member care, and participation programs.', display_order = 1,
      organization_type = 'Division', team_ids = '["team-ccgg-care","team-community-operations"]'::jsonb
      where id = 'division-intelligence';
    update divisions set slug = 'strategic-analysis', name_ko = '전략분석사업부', name_en = 'Strategic Analysis Division',
      description = 'Analyzes markets, industries, policy, law, and prediction signals.',
      description_ko = '시장·산업·정책·법률·예측 신호를 분석해 판단 가능한 관점을 만듭니다.',
      description_en = 'Analyzes markets, industries, policy, law, and prediction signals.', display_order = 2,
      organization_type = 'Division', team_ids = '["team-prediction-market","team-economy-industry-analysis","team-policy-legal-analysis"]'::jsonb
      where id = 'division-governance';
    update divisions set slug = 'technology', name_ko = '테크놀로지사업부', name_en = 'Technology Division',
      description = 'Researches AI and builds product and data capabilities for the studio.',
      description_ko = 'AI 연구, 프로덕트 개발, 데이터 분석으로 스튜디오의 기술 기반을 구축합니다.',
      description_en = 'Researches AI and builds product and data capabilities for the studio.', display_order = 3,
      organization_type = 'Division', team_ids = '["team-ai-research-engineering","team-product-development","team-data-analytics"]'::jsonb
      where id = 'division-studio';
    update divisions set slug = 'media-content', name_ko = '미디어콘텐츠사업부', name_en = 'Media Content Division',
      description = 'Turns verified company output into editorial, production, and channel formats.',
      description_ko = '검증된 결과물을 뉴스·에디토리얼·콘텐츠 제작·채널 운영으로 확장합니다.',
      description_en = 'Turns verified company output into editorial, production, and channel formats.', display_order = 4,
      organization_type = 'Division', team_ids = '["team-news-editorial","team-content-production","team-channel-operations"]'::jsonb
      where id = 'division-editorial';
    update divisions set slug = 'business-development', name_ko = '사업개발본부', name_en = 'Business Development Headquarters',
      description = 'Builds partnerships, B2B production operations, and IP business opportunities.',
      description_ko = '사업개발·제휴, B2B 제작 운영, IP 사업 기회를 연결합니다.',
      description_en = 'Builds partnerships, B2B production operations, and IP business opportunities.', display_order = 6,
      organization_type = 'Headquarters', team_ids = '["team-business-development-partnerships","team-b2b-production-operations","team-ip-business"]'::jsonb
      where id = 'division-strategy';
    insert into divisions (id, company_id, slug, name_ko, name_en, description, description_ko, description_en, icon, display_order, status, organization_type, team_ids, department_ids)
      values ('division-entertainment','company-pss','entertainment','엔터테인먼트사업부','Entertainment Business Division','Develops artists, entertainment formats, stories, and cultural IP.','아티스트와 예능·게임·스토리·문화 콘텐츠를 장기 IP로 발전시킵니다.','Develops artists, entertainment formats, stories, and cultural IP.','Clapperboard',5,'Planning','Division','["team-artist-management","team-artist","team-entertainment-gaming-content","team-story-culture-content"]'::jsonb,'[]'::jsonb)
      on conflict (id) do nothing;

    update companies set division_ids = '["division-intelligence","division-governance","division-studio","division-editorial","division-entertainment","division-strategy"]'::jsonb where id = 'company-pss';

    create table teams (
      id text primary key, division_id text not null references divisions(id) on delete restrict,
      slug text not null unique, name_ko text not null, name_en text not null,
      description_ko text not null, description_en text not null, display_order integer not null,
      status text not null check (status in ('Planning','Active','Paused','Archived')),
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create index teams_division_order_idx on teams(division_id, display_order);

    insert into teams (id, division_id, slug, name_ko, name_en, description_ko, description_en, display_order, status) values
      ('team-ccgg-care','division-intelligence','ccgg-care','CCGG 케어팀','CCGG Care Team','CCGG 이용자 케어와 시장·산업 시그널 큐레이션을 담당합니다.','Curates market signals while supporting the CCGG community.',1,'Active'),
      ('team-community-operations','division-intelligence','community-operations','커뮤니티운영팀','Community Operations Team','커뮤니티 운영 정책과 참여 프로그램을 설계합니다.','Designs community operations and participation programs.',2,'Planning'),
      ('team-prediction-market','division-governance','prediction-market','예측시장팀','Prediction Market Team','확률·배당·이벤트 시나리오와 군중 심리를 분석합니다.','Analyzes odds, event scenarios, and crowd psychology.',1,'Active'),
      ('team-economy-industry-analysis','division-governance','economy-industry-analysis','경제·산업분석팀','Economy & Industry Analysis Team','거시경제와 산업 구조 변화를 분석합니다.','Analyzes macroeconomic and industry structure changes.',2,'Planning'),
      ('team-policy-legal-analysis','division-governance','policy-legal-analysis','정책·법률분석팀','Policy & Legal Analysis Team','정책과 법률 이슈를 분석하고 콘텐츠 리스크를 검토합니다.','Analyzes policy and legal issues and reviews content risk.',3,'Planning'),
      ('team-ai-research-engineering','division-studio','ai-research-engineering','AI기술연구팀','AI Research & Engineering Team','생성형 AI와 신기술을 연구하고 제품 적용 가능성을 해설합니다.','Researches generative AI and translates technology into product insight.',1,'Active'),
      ('team-product-development','division-studio','product-development','프로덕트개발팀','Product Development Team','PSS 제품 경험과 운영 도구를 구현합니다.','Builds PSS product experiences and operating tools.',2,'Active'),
      ('team-data-analytics','division-studio','data-analytics','데이터분석팀','Data Analytics Team','제품·콘텐츠·운영 데이터를 분석합니다.','Analyzes product, content, and operating data.',3,'Planning'),
      ('team-news-editorial','division-editorial','news-editorial','뉴스에디토리얼팀','News & Editorial Team','뉴스와 분석 결과를 편집 콘텐츠로 구성합니다.','Shapes news and analysis into editorial content.',1,'Planning'),
      ('team-content-production','division-editorial','content-production','콘텐츠제작팀','Content Production Team','웹·영상·소셜 콘텐츠를 제작합니다.','Produces web, video, and social content.',2,'Planning'),
      ('team-channel-operations','division-editorial','channel-operations','채널운영팀','Channel Operations Team','콘텐츠 채널의 발행과 운영을 담당합니다.','Operates publishing and distribution channels.',3,'Planning'),
      ('team-artist-management','division-entertainment','artist-management','아티스트매니지먼트팀','Artist Management Team','AI 아티스트의 성장과 활동 계획을 운영합니다.','Manages AI artist growth and activities.',1,'Planning'),
      ('team-artist','division-entertainment','artist','아티스트팀','Artist Team','음악·퍼포먼스 기반 AI 아티스트 IP를 개발합니다.','Develops music and performance-based AI artist IP.',2,'Planning'),
      ('team-entertainment-gaming-content','division-entertainment','entertainment-gaming-content','예능·게임콘텐츠팀','Entertainment & Gaming Content Team','예능과 게임 기반 캐릭터 콘텐츠를 개발합니다.','Develops entertainment and gaming character content.',3,'Planning'),
      ('team-story-culture-content','division-entertainment','story-culture-content','스토리·문화콘텐츠팀','Story & Culture Content Team','세계관·스토리·문화형 IP를 개발합니다.','Develops worldbuilding, stories, and cultural IP.',4,'Planning'),
      ('team-business-development-partnerships','division-strategy','business-development-partnerships','사업개발·제휴팀','Business Development & Partnerships Team','파트너십과 신규 사업 기회를 발굴합니다.','Develops partnerships and new business opportunities.',1,'Planning'),
      ('team-b2b-production-operations','division-strategy','b2b-production-operations','B2B 제작운영팀','B2B Production & Operations Team','기업 대상 캐릭터·콘텐츠 제작 운영을 담당합니다.','Operates B2B character and content production.',2,'Planning'),
      ('team-ip-business','division-strategy','ip-business','IP사업팀','IP Business Team','캐릭터 IP의 사업화와 라이선싱을 설계합니다.','Designs commercialization and licensing for character IP.',3,'Planning');

    alter table characters add column team_id text;
    update characters set team_id = 'team-ccgg-care' where id = 'char-001';
    update characters set team_id = 'team-prediction-market' where id = 'char-002';
    update characters set team_id = 'team-ai-research-engineering' where id = 'char-003';
    alter table characters alter column team_id set not null;
    alter table characters add constraint characters_team_id_fkey foreign key (team_id) references teams(id) on delete restrict;
    create index characters_team_idx on characters(team_id);
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    drop index if exists characters_team_idx;
    alter table characters drop constraint if exists characters_team_id_fkey;
    alter table characters drop column if exists team_id;
    drop table if exists teams;
    alter table divisions drop column if exists team_ids;
    alter table divisions drop column if exists organization_type;
  `.execute(db);
}
