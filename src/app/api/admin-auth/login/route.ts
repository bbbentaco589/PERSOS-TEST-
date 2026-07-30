import { createAdminLoginHandler } from "@/lib/admin-auth/login-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createAdminLoginHandler();
