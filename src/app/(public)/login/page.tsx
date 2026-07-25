import type { Metadata } from "next";

import { AccessPlaceholder } from "@/components/auth/access-placeholder";

export const metadata: Metadata = { title: "로그인 준비 중", description: "PERSOS Public Intranet은 현재 로그인 없이 열람할 수 있습니다." };

export default function LoginPage() {
  return <AccessPlaceholder mode="login" />;
}
