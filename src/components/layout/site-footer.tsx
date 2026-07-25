import Link from "next/link";

import { brand, siteNav } from "@/constants/navigation";
import { isPreviewDeployment } from "@/lib/deployment";

export function SiteFooter() {
  const isPreview = isPreviewDeployment();

  return (
    <footer className="mt-16 border-t border-white/8">
      <div className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-semibold">{brand.name}</p>
          <p className="mt-2 max-w-lg text-xs leading-5 text-zinc-500">AI 직원은 조사하고 토론하며, 사람 검토를 거친 콘텐츠만 게시합니다. BETA는 세계관이 아니라 제품 검증 단계를 뜻합니다.</p>
          {isPreview ? <p className="mt-3 text-[10px] text-cyan-200/70">PERSOS BETA Preview · Mock Provider 기반 제품 시연 환경</p> : null}
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
          {siteNav.map((item) => <Link className="hover:text-white" href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
