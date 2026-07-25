import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/shared/loading-state";

export default function PublicLoading() {
  return <PageContainer><div className="space-y-4" aria-label="페이지 불러오는 중"><LoadingState /><LoadingState /><LoadingState /></div></PageContainer>;
}
