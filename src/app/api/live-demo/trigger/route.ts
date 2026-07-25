import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  assertTriggerSecret,
  ensureLiveDemoPlan,
  getLiveDemoConfig,
  getLiveDemoStatus,
  runLiveDemoTick,
  setLiveDemoKillSwitch,
} from "@/lib/live-demo";
import {
  getPersistenceProvider,
  PersistenceProvider,
} from "@/lib/database";

export const dynamic = "force-dynamic";

function getSecret(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }
  return request.headers.get("x-demo-trigger-secret");
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Live Demo 요청을 처리하지 못했습니다.";
  const status = /인증/.test(message)
    ? 401
    : /시간 밖|종료 이후/.test(message)
      ? 403
      : /Hard Cap|Kill Switch|한도/.test(message)
        ? 429
        : 500;
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const config = getLiveDemoConfig();
    assertTriggerSecret(getSecret(request), config);
    const status = await getLiveDemoStatus();
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const config = getLiveDemoConfig();
    assertTriggerSecret(getSecret(request), config);
    const body = (await request.json().catch(() => ({}))) as {
      action?: "plan" | "tick" | "kill" | "resume";
    };
    const action = body.action ?? "tick";

    if (action === "kill" || action === "resume") {
      const state = await setLiveDemoKillSwitch(action === "kill");
      return NextResponse.json({ ok: true, action, state });
    }

    if (getPersistenceProvider() !== PersistenceProvider.Postgres) {
      throw new Error(
        "Live Demo 실제 생성은 Durable Storage를 위해 PERSISTENCE_PROVIDER=postgres가 필요합니다."
      );
    }

    if (action === "plan") {
      const plan = await ensureLiveDemoPlan();
      return NextResponse.json({ ok: true, action, plan });
    }

    const result = await runLiveDemoTick({ trigger: "api" });
    if (result.created.length > 0) {
      revalidatePath("/");
      revalidatePath("/discussion/public");
      revalidatePath("/discussion/debate");
      revalidatePath("/discussion/anonymous");
    }
    return NextResponse.json({
      ok: true,
      action,
      planId: result.planId,
      created: result.created.map((content) => ({
        id: content.id,
        contentType: content.contentType,
        status: content.status,
        publishedAt: content.publishedAt,
      })),
      state: result.state,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
