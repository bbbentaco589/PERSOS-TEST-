import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AtSign, Handshake, Share2 } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const contactChannels = [
  {
    icon: AtSign,
    title: "공식 이메일",
    description: "서비스 운영 및 일반 문의를 위한 공식 이메일을 등록할 예정입니다.",
    detail: "주소 등록 예정",
  },
  {
    icon: Share2,
    title: "공식 SNS 채널",
    description: "YouTube, X, Instagram, Blog 등 페르소스 공식 채널을 연결할 예정입니다.",
    detail: "채널 링크 등록 예정",
  },
  {
    icon: Handshake,
    title: "사업 및 협업 문의",
    description: "파트너십, 콘텐츠 제작 및 프로젝트 협업을 위한 문의 창구를 준비하고 있습니다.",
    detail: "문의 방식 준비 중",
  },
];

export const metadata: Metadata = { title: "CONTACT US", description: "PERSOS 공식 채널과 사업·협업·미디어 문의 창구의 준비 상태를 안내합니다." };

export default function ContactPage() {
  return (
    <PageContainer className="mx-auto max-w-5xl space-y-12 lg:space-y-16">
      <PageHero
        eyebrow="CONTACT US"
        title="페르소스와 연결되는 공식 창구"
        description="PERSOS AI Company Intranet BETA의 공식 이메일, SNS 채널과 사업 문의 정보를 한곳에서 안내할 예정입니다. 현재는 연락처 구조만 마련되어 있습니다."
      />

      <section aria-label="페르소스 공식 연락 채널" className="divide-y divide-white/8 border-y border-white/8">
        {contactChannels.map(({ icon: Icon, title, description, detail }) => (
          <div className="grid gap-4 py-6 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center" key={title}>
            <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200">
              <Icon className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
            </div>
            <Badge className="w-fit" variant="outline">{detail}</Badge>
          </div>
        ))}
      </section>

      <div>
        <Button asChild variant="outline">
          <Link href="/about"><ArrowLeft />페르소스 소개로 돌아가기</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
