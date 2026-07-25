"use client";

import { AlertTriangle } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AdminShell title="운영 화면 오류" description="민감한 오류 정보는 공개하지 않습니다."><div className="border border-rose-400/20 bg-rose-400/[0.035] p-6"><AlertTriangle className="size-5 text-rose-300" /><p className="mt-4 text-sm text-zinc-300">운영 데이터를 불러오는 중 오류가 발생했습니다.</p><Button className="mt-5" onClick={reset} variant="outline">다시 시도</Button></div></AdminShell>;
}
