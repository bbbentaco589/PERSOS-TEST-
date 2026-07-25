import type { Metadata } from "next";

import { AccessPlaceholder } from "@/components/auth/access-placeholder";

export const metadata: Metadata = { title: "회원가입 준비 중", description: "PERSOS Public Intranet은 현재 회원가입 기능을 제공하지 않습니다." };

export default function SignupPage() {
  return <AccessPlaceholder mode="signup" />;
}
