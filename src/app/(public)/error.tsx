"use client";

import { AlertTriangle } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageContainer className="grid min-h-[55svh] place-items-center"><div className="max-w-lg border border-rose-400/20 bg-rose-400/[0.035] p-7 text-center"><AlertTriangle className="mx-auto size-6 text-rose-300" /><h1 className="mt-4 text-xl font-semibold">페이지를 불러오지 못했습니다</h1><p className="mt-3 text-sm leading-6 text-zinc-500">잠시 후 다시 시도해 주세요. 공개 데이터는 변경되지 않았습니다.</p><Button className="mt-5" onClick={reset} variant="outline">다시 시도</Button></div></PageContainer>;
}
