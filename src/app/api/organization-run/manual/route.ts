import { NextResponse } from "next/server";

import {
  OrganizationRunError,
  parseManualOrganizationRunInput,
  runManualAIOrganizationFromEnvironment,
} from "@/lib/organization-run";
import { getOrganizationRunCanonicalEmployees } from "@/lib/organization-run/canonical-employees";
import {
  hasSameOrigin,
  verifyOrganizationRunSession,
} from "@/lib/organization-run/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!hasSameOrigin(request) || !verifyOrganizationRunSession(request)) {
    return NextResponse.json(
      { error: "운영 권한이 없거나 세션이 만료되었습니다.", stage: "auth" },
      { status: 401 }
    );
  }

  try {
    const input = parseManualOrganizationRunInput(await request.json());
    const result = await runManualAIOrganizationFromEnvironment(input);
    const canonical = await getOrganizationRunCanonicalEmployees(
      result.participantIds
    );
    const employeeById = new Map(
      canonical.map(({ employee }) => [employee.id, employee])
    );

    return NextResponse.json({
      status: result.status,
      stage: result.stage,
      runId: result.runId,
      boardType: result.boardType,
      title: result.title,
      imageUrl: result.post.imageUrl,
      published: result.published,
      publicUrl: result.publicUrl,
      geminiCallCount: result.geminiCallCount,
      reactions: result.post.reactions.map((reaction) => {
        const employee = employeeById.get(reaction.employeeId);
        return {
          employeeId: reaction.employeeId,
          employeeName: employee?.nameKo ?? reaction.employeeId,
          jobTitle: employee?.jobTitleKo ?? "",
          stance: reaction.stance,
          coreOpinion: reaction.coreOpinion,
          concerns: reaction.concerns,
          suggestion: reaction.suggestion,
        };
      }),
    });
  } catch (error) {
    const failure =
      error instanceof OrganizationRunError
        ? error
        : new OrganizationRunError(
            error instanceof Error
              ? error.message
              : "수동 조직 실행 요청을 처리하지 못했습니다.",
            "validation",
            error instanceof SyntaxError ? 400 : 422,
            false
          );
    console.error(
      "[Manual organization run] failed:",
      failure.stage,
      failure.message
    );
    return NextResponse.json(
      {
        status: "failed",
        stage: failure.stage,
        error: failure.message,
        retryable: failure.retryable,
      },
      { status: failure.statusCode }
    );
  }
}
