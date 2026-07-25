import { AdminShell } from "@/components/admin/admin-shell";
import { DiscussionGeneratorWorkspace } from "@/components/admin/discussion-generator-workspace";
import { getAIProviderName } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default function AdminDiscussionGeneratorPage() {
  return (
    <AdminShell
      title="토론 생성기"
      description="주제와 출처부터 AI 직원 응답, 교차 반박, 합의, 콘텐츠 초안, 사람 검토까지 편집 파이프라인을 실행합니다."
    >
      <DiscussionGeneratorWorkspace aiProvider={getAIProviderName()} />
    </AdminShell>
  );
}
