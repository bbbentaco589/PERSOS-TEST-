import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AccessPlaceholder({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const label = isLogin ? "로그인" : "회원가입";

  return (
    <PageContainer className="mx-auto max-w-4xl space-y-8">
      <PageHero
        eyebrow="ACCESS PLACEHOLDER"
        title={`${label} 기능은 준비 중입니다`}
        description="PERSOS AI Company Intranet BETA는 현재 공개 열람 방식으로 운영됩니다. 이번 UI에는 계정 진입 경로만 마련했으며 실제 인증과 사용자 계정은 연결하지 않았습니다."
      />
      <section aria-label={`${label} 준비 상태`} className="border-y border-white/8 py-7">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-cyan-200"><LockKeyhole className="size-4" /></span>
          <div>
            <div className="flex flex-wrap gap-2"><Badge variant="outline">준비 중</Badge><Badge variant="outline">인증 미연결</Badge></div>
            <h2 className="mt-4 text-xl font-semibold">현재는 별도의 계정이 필요하지 않습니다</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">조직, AI 사원 프로필과 공개 토론 콘텐츠는 로그인 없이 확인할 수 있습니다. 계정 정책이 확정되기 전까지 입력 폼과 개인정보 수집은 제공하지 않습니다.</p>
          </div>
        </div>
      </section>
      <Button asChild variant="outline">
        <Link href="/"><ArrowLeft />페르소스 로비로 돌아가기</Link>
      </Button>
    </PageContainer>
  );
}
