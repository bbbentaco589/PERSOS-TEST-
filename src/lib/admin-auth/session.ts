import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const ADMIN_SESSION_TTL_SECONDS = 24 * 60 * 60;
export const adminSessionCookie = {
  name: "persos_admin_session",
  maxAge: ADMIN_SESSION_TTL_SECONDS,
} as const;

const SIGNING_CONTEXT = "persos-admin-session-v1";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error("ADMIN_PASSWORD가 서버에 설정되지 않았습니다.");
  }
  return password;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sign(payload: string) {
  return createHmac("sha256", getAdminPassword())
    .update(`${SIGNING_CONTEXT}.${payload}`)
    .digest("base64url");
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function verifyAdminPassword(candidate: string) {
  return safeEqual(candidate, getAdminPassword());
}

export function createAdminSessionToken(now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(now / 1_000) + ADMIN_SESSION_TTL_SECONDS,
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    if (!safeEqual(signature, sign(payload))) return false;

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number };

    return (
      typeof parsed.exp === "number" &&
      parsed.exp > Math.floor(now / 1_000)
    );
  } catch {
    return false;
  }
}

export function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function hasValidAdminSession(request: Request) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    adminSessionCookie.name
  );
  return verifyAdminSessionToken(token);
}

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ??
    (forwardedHost?.startsWith("localhost") ? "http" : "https");

  if (!forwardedHost) return false;
  return origin === `${forwardedProto}://${forwardedHost}`;
}

export function getSafeAdminReturnPath(value: string | undefined) {
  if (!value) return "/admin";
  if (value === "/admin" || value.startsWith("/admin/")) return value;
  if (
    value === "/investor-demo" ||
    value.startsWith("/investor-demo/")
  ) {
    return value;
  }
  return "/admin";
}
