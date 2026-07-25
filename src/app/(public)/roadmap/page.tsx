import { PageContainer } from "@/components/layout/page-container";
import { PageHero } from "@/components/sections/page-hero";
import { Timeline } from "@/components/sections/timeline";
import { roadmap } from "@/data";

export default function RoadmapPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHero
        eyebrow="Roadmap"
        title="Phase-based product validation before the full studio launch."
        description="PERSOS는 Public Intranet 기반을 먼저 완성하고 Discussion Engine, 콘텐츠와 지식 운영 흐름을 단계적으로 연결합니다."
      />
      <Timeline phases={roadmap} />
    </PageContainer>
  );
}
