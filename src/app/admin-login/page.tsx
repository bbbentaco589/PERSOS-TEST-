import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { getSafeAdminReturnPath } from "@/lib/admin-auth/session";
import { hasServerAdminSession } from "@/lib/admin-auth/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "관리자 로그인",
  description: "PERSOS 관리자 및 투자자 데모 전용 접근 인증 화면입니다.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = getSafeAdminReturnPath(nextValue);

  if (await hasServerAdminSession()) {
    redirect(nextPath);
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[#07080a] px-4 py-10 text-foreground">
      <section
        aria-labelledby="admin-login-title"
        className="w-full max-w-md rounded-md border border-white/10 bg-[#0b0d11] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
          <span className="relative h-10 w-32 overflow-hidden">
            <Image
              alt="PERSOS Persona Operating System"
              className="scale-125 object-cover object-center"
              fill
              priority
              sizes="128px"
              src="/brand/persos-horizontal-transparent.png"
              unoptimized
            />
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-cyan-300/25 bg-cyan-300/8 px-2 text-[9px] font-semibold tracking-wide text-cyan-100">
            <ShieldCheck className="size-3" />
            PROTECTED
          </span>
        </div>
        <div className="pt-6">
          <p className="text-[10px] font-semibold uppercase text-cyan-200/70">
            PERSOS ADMIN ACCESS
          </p>
          <h1 className="mt-3 text-2xl font-semibold" id="admin-login-title">
            관리자 인증
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            관리자 콘솔과 투자자 데모는 승인된 운영자만 접근할 수 있습니다.
            인증은 24시간 동안 유지됩니다.
          </p>
          <AdminLoginForm nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
