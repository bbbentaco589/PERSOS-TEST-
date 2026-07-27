import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import {
  buildEmployeeReactionSystemInstruction,
  createEmployeeReactionResponseSchema,
  EMPLOYEE_REACTION_IDS,
  parseEmployeeReactions,
  StructuredEmployeeReactionError,
} from "@/lib/ai/employee-reaction-prompt-builder";
import { getRepositories } from "@/lib/repositories";
import type {
  EmployeeReactionBoard,
} from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const MAX_MESSAGE_LENGTH = 4_000;
const VALID_BOARDS: EmployeeReactionBoard[] = [
  "investor-demo",
  "public-feed",
  "debate",
  "anonymous",
];

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
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
    return NextResponse.json(
      { error: "메시지를 입력해 주세요." },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH || title.length > 300) {
    return NextResponse.json(
      {
        error: `본문은 ${MAX_MESSAGE_LENGTH.toLocaleString("ko-KR")}자, 제목은 300자 이하여야 합니다.`,
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const canonicalEmployees = await getCanonicalEmployees();
    const client = new GoogleGenAI({ apiKey });
    const result = await client.models.generateContent({
      model,
      contents: `게시글 제목:\n${title}\n\n게시글 본문:\n${message}`,
      config: {
        abortSignal: controller.signal,
        systemInstruction: buildEmployeeReactionSystemInstruction({
          board,
          title,
          body: message,
          employees: canonicalEmployees,
        }),
        responseMimeType: "application/json",
        responseJsonSchema: createEmployeeReactionResponseSchema(),
        temperature: 0.65,
        maxOutputTokens: 2_200,
      },
    });
    const responseText = result.text?.trim();

    if (!responseText) {
      return NextResponse.json(
        { error: "Gemini가 비어 있는 응답을 반환했습니다." },
        { status: 502 }
      );
    }

    const reactions = parseEmployeeReactions(responseText).map((reaction) => {
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

    return NextResponse.json({ board, title, reactions });
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
          : error instanceof Error
            ? error.message
            : "unknown error"
    );

    return NextResponse.json(
      {
        error: isTimeout
          ? "Gemini 응답 시간이 초과되었습니다."
          : isStructuredResponseError
            ? error.message
            : "Gemini 응답을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isTimeout ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
