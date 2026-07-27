import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const COOKIE_NAME = "persos_org_run_session";
const SESSION_TTL_SECONDS = 30 * 60;

function getSecret() {
  const secret = process.env.DEMO_TRIGGER_SECRET?.trim();
  if (!secret) throw new Error("DEMO_TRIGGER_SECRET이 설정되지 않았습니다.");
  return secret;
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
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function verifyTriggerSecret(candidate: string) {
  return safeEqual(candidate, getSecret());
}

export function createOrganizationRunSession() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1_000) + SESSION_TTL_SECONDS,
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  return cookies
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function verifyOrganizationRunSession(request: Request) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return false;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now() / 1_000;
  } catch {
    return false;
  }
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

export const organizationRunSessionCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_TTL_SECONDS,
};
