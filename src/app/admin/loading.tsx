import { AdminShell } from "@/components/admin/admin-shell";
import { LoadingState } from "@/components/shared/loading-state";

export default function AdminLoading() {
  return <AdminShell title="운영 데이터 불러오는 중" description="Repository와 Provider 상태를 확인하고 있습니다."><div className="grid gap-4 md:grid-cols-2"><LoadingState /><LoadingState /></div></AdminShell>;
}
