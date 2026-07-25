const baseUrl = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const secret = process.env.DEMO_TRIGGER_SECRET;
const startAt = new Date(
  process.env.LIVE_DEMO_START_AT ?? "2026-07-25T20:00:00+09:00"
);
const endAt = new Date(
  process.env.LIVE_DEMO_END_AT ?? "2026-07-25T23:00:00+09:00"
);

if (!secret) {
  throw new Error("DEMO_TRIGGER_SECRET이 필요합니다.");
}

async function trigger(action: "plan" | "tick") {
  const response = await fetch(`${baseUrl}/api/live-demo/trigger`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ action }),
  });
  const result = (await response.json()) as {
    ok?: boolean;
    error?: string;
    created?: Array<{ id: string; contentType: string }>;
  };
  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? `Trigger HTTP ${response.status}`);
  }
  return result;
}

async function wait(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function run() {
  console.log(`[PERSOS Live Demo] TECT 계획 확인: ${new Date().toISOString()}`);
  await trigger("plan");

  while (Date.now() < startAt.getTime()) {
    const remaining = startAt.getTime() - Date.now();
    console.log(
      `[PERSOS Live Demo] 시작 대기: ${Math.ceil(remaining / 60_000)}분`
    );
    await wait(Math.min(remaining, 60_000));
  }

  while (Date.now() < endAt.getTime()) {
    try {
      const result = await trigger("tick");
      if (result.created?.length) {
        console.log(
          `[PERSOS Live Demo] ${new Date().toISOString()} 생성 ${result.created.length}건`
        );
      }
    } catch (error) {
      console.error(
        `[PERSOS Live Demo] Tick 실패: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
    await wait(60_000);
  }

  console.log("[PERSOS Live Demo] 종료 시각 도달. Runner를 종료합니다.");
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
