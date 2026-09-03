import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { DEFAULT_GEMINI_MODEL } from "@/lib/ai/config";
import {
  hasSameOrigin,
  hasValidAdminSession,
} from "@/lib/admin-auth/session";

import {
  buildEmployeeReactionSystemInstruction,
  createEmployeeReactionResponseSchema,
  EMPLOYEE_REACTION_IDS,
  parseEmployeeReactions,
  StructuredEmployeeReactionError,
} from "@/lib/ai/employee-reaction-prompt-builder";
import { getRepositories } from "@/lib/repositories";
import { checkRequestRateLimit } from "@/lib/security/request-rate-limit";
import type {
  EmployeeReactionBoard,
} from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_REQUEST_BYTES = 16_384;
const CHAT_RATE_LIMIT = {
  scope: "admin-chat",
  limit: 6,
  windowSeconds: 10 * 60,
} as const;
const VALID_BOARDS: EmployeeReactionBoard[] = [
  "investor-demo",
  "public-feed",
  "debate",
  "anonymous",
];

function privateJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

function getTimeoutMs() {
  const value = Number(process.env.GEMINI_TIMEOUT_MS ?? 30_000);
  return Number.isFinite(value) && value >= 1_000 && value <= 120_000
    ? value
    : 30_000;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoard(value: unknown): value is EmployeeReactionBoard {
  return VALID_BOARDS.includes(value as EmployeeReactionBoard);
}

async function getCanonicalEmployees() {
  const repositories = getRepositories();
  const [employees, divisions, teams] = await Promise.all([
    Promise.all(
      EMPLOYEE_REACTION_IDS.map((employeeId) =>
        repositories.characters.getCharacterById(employeeId)
      )
    ),
    repositories.organization.listDivisions(),
    repositories.organization.listTeams(),
  ]);

  return EMPLOYEE_REACTION_IDS.map((employeeId, index) => {
    const employee = employees[index];
    if (!employee) {
      throw new StructuredEmployeeReactionError(
        `${employeeId} Character Canonical을 찾지 못했습니다.`
      );
    }

    return {
      employee,
      divisionName:
        divisions.find((division) => division.id === employee.divisionId)
          ?.nameKo ?? employee.divisionId,
      teamName:
        teams.find((team) => team.id === employee.teamId)?.nameKo ??
        employee.teamId,
    };
  });
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return privateJson(
      { error: "허용되지 않은 요청입니다." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!hasValidAdminSession(request)) {
    return privateJson(
      { error: "관리자 인증이 필요합니다." },
      { status: 401 }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return privateJson(
      { error: "요청 본문이 너무 큽니다." },
      { status: 413, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rateLimit = await checkRequestRateLimit(request, CHAT_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return privateJson(
      {
        error: rateLimit.available
          ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
          : "요청 보호 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      },
      {
        status: rateLimit.available ? 429 : 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfter),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return privateJson(
      { error: "요청 본문은 올바른 JSON이어야 합니다." },
      { status: 400 }
    );
  }

  const requestBody = isRecord(body) ? body : {};
  const message =
    typeof requestBody.message === "string" ? requestBody.message.trim() : "";
  const title =
    typeof requestBody.title === "string" && requestBody.title.trim()
      ? requestBody.title.trim()
      : "내부 검토 안건";
  const board = isBoard(requestBody.board)
    ? requestBody.board
    : "investor-demo";

  if (!message) {
    return privateJson(
      { error: "메시지를 입력해 주세요." },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH || title.length > 300) {
    return privateJson(
      {
        error: `본문은 ${MAX_MESSAGE_LENGTH.toLocaleString("ko-KR")}자, 제목은 300자 이하여야 합니다.`,
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return privateJson(
      { error: "AI 응답 서비스를 사용할 수 없습니다." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  try {
    const canonicalEmployees = await getCanonicalEmployees();
    const client = new GoogleGenAI({ apiKey });
    const generated = await Promise.all(
      canonicalEmployees.map(async (canonical) => {
        const employeeIds = [canonical.employee.id];
        const result = await client.models.generateContent({
          model,
          contents: `게시글 제목:\n${title}\n\n게시글 본문:\n${message}`,
          config: {
            abortSignal: controller.signal,
            systemInstruction: buildEmployeeReactionSystemInstruction({
              board,
              title,
              body: message,
              employees: [canonical],
            }),
            responseMimeType: "application/json",
            responseJsonSchema: createEmployeeReactionResponseSchema(employeeIds),
            temperature: 0.65,
            maxOutputTokens: 900,
          },
        });
        const responseText = result.text?.trim();
        if (!responseText) {
          throw new StructuredEmployeeReactionError(
            `${canonical.employee.id} Gemini가 비어 있는 응답을 반환했습니다.`
          );
        }
        return parseEmployeeReactions(responseText, employeeIds)[0];
      })
    );

    const reactions = generated.map((reaction) => {
      const canonical = canonicalEmployees.find(
        ({ employee }) => employee.id === reaction.employeeId
      );
      if (!canonical) {
        throw new StructuredEmployeeReactionError(
          `${reaction.employeeId} Canonical 결합에 실패했습니다.`
        );
      }

      return {
        ...reaction,
        name: canonical.employee.nameKo,
        role: canonical.employee.jobTitleKo,
        profileImage: canonical.employee.profileImage,
        divisionName: canonical.divisionName,
        teamName: canonical.teamName,
      };
    });

    return privateJson(
      { board, title, reactions },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" || /abort|timeout/i.test(error.message));
    const isStructuredResponseError =
      error instanceof StructuredEmployeeReactionError;

    console.error(
      "[Gemini employee reactions] request failed:",
      isTimeout
        ? "request timeout"
        : isStructuredResponseError
          ? "invalid structured response"
          : "upstream request failed"
    );

    return privateJson(
      {
        error: isTimeout
          ? "Gemini 응답 시간이 초과되었습니다."
          : "AI 응답을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      {
        status: isTimeout ? 504 : 502,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}
