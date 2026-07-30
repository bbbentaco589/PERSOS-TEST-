import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminSessionCookie,
  verifyAdminSessionToken,
} from "@/lib/admin-auth/session";

export async function hasServerAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(
    cookieStore.get(adminSessionCookie.name)?.value
  );
}

export async function requireAdminSession(returnPath: string) {
  if (await hasServerAdminSession()) return;
  redirect(`/admin-login?next=${encodeURIComponent(returnPath)}`);
}
