import { AlertTriangle } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrganizationReviewQueue } from "@/components/admin/organization-review-queue";
import { OperationsMetric } from "@/components/admin/operations-ui";
import {
  getOrganizationRunPublisher,
  isOrganizationRunKVConfigured,
} from "@/lib/organization-run";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage() {
  const publisher = getOrganizationRunPublisher();
  const pending = publisher
    ? await publisher.listReviewItems("review_pending").catch(() => [])
    : [];
  const highRiskCount = pending.filter((item) => item.riskLevel === "high").length;

  return (
    <AdminShell
      title="예외 검수 큐"
      description="Automated QA 실패, 출처 불충분, 고위험 또는 시스템 오류로 자동 공개가 보류된 콘텐츠만 처리합니다."
    >
      <div className="flex items-center gap-2 text-xs text-amber-200">
        <AlertTriangle className="size-4" />
        QA 통과 콘텐츠는 기본적으로 자동 발행되며 이 화면에 들어오지 않습니다.
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <OperationsMetric detail="실제 KV 저장 데이터" label="검수 대기" tone="warning" value={`${pending.length}건`} />
        <OperationsMetric detail="법률·금전·계약·채용·비공개" label="고위험" tone="danger" value={`${highRiskCount}건`} />
        <OperationsMetric detail="환경변수로만 선택 가능" label="전건 검수 모드" value={process.env.AI_REQUIRE_FOUNDER_REVIEW === "true" ? "ON" : "OFF"} />
      </div>
      <OrganizationReviewQueue
        initialItems={pending}
        storageConfigured={isOrganizationRunKVConfigured()}
      />
    </AdminShell>
  );
}
