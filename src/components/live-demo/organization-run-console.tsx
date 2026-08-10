"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LoaderCircle,
  Play,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ManualOrganizationRunForm,
  type ManualOrganizationRunEmployee,
} from "@/components/live-demo/manual-organization-run-form";

type RunResult = {
  status: "completed";
  title: string;
  boardType: "public" | "debate" | "anonymous";
  participants: Array<{ id: string; name: string }>;
  publicUrl?: string;
  published: boolean;
  reviewPending: boolean;
  geminiCallCount: number;
};

const stages = [
  "주제 생성 중",
  "게시판 선택",
  "참여 직원 선정",
  "직원 반응 생성",
  "검증",
  "발행",
] as const;

const boardLabels = {
  public: "전사원 공개 피드",
  debate: "전사원 찬반 토론",
  anonymous: "전사원 익명 채팅",
} as const;

export function OrganizationRunConsole({
  manualEmployees,
}: {
  manualEmployees?: ManualOrganizationRunEmployee[];
} = {}) {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState<"automatic" | "manual">("automatic");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState("");
  const [failureStage, setFailureStage] = useState("");
  const [result, setResult] = useState<RunResult>();

  useEffect(() => {
    let active = true;
    void fetch("/api/organization-run/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { unlocked?: boolean }) => {
        if (active && data.unlocked) setUnlocked(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setStageIndex((current) => Math.min(current + 1, stages.length - 1));
    }, 2_400);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!secret.trim() || isUnlocking) return;
    setIsUnlocking(true);
    setError("");
    try {
      const response = await fetch("/api/organization-run/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = (await response.json()) as {
        unlocked?: boolean;
        error?: string;
      };
      if (!response.ok || !data.unlocked) {
        throw new Error(data.error || "운영 잠금을 해제하지 못했습니다.");
      }
      setUnlocked(true);
      setSecret("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "운영 잠금 해제에 실패했습니다."
      );
    } finally {
      setIsUnlocking(false);
    }
  }

  async function runOrganization() {
    if (isRunning) return;
    setIsRunning(true);
    setStageIndex(0);
    setError("");
    setFailureStage("");
    setResult(undefined);
    try {
      const response = await fetch("/api/organization-run/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await response.json()) as RunResult & {
        error?: string;
        stage?: string;
      };
      if (!response.ok || data.status !== "completed") {
        setFailureStage(data.stage || "unknown");
        if (response.status === 401) setUnlocked(false);
        throw new Error(data.error || "AI 조직 실행에 실패했습니다.");
      }
      setStageIndex(stages.length - 1);
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI 조직 실행에 실패했습니다."
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-md border border-white/10 bg-[#0b0d11]">
      <header className="border-b border-white/8 bg-white/[0.025] px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-zinc-100">
          Founder 운영 콘솔
        </h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          한 번의 실행으로 신규 주제와 직원 반응을 생성하고 공개 게시판에 발행합니다.
        </p>
      </header>

      {unlocked && manualEmployees?.length ? (
        <div className="grid grid-cols-2 border-b border-white/8 p-2">
          <Button
            onClick={() => setMode("automatic")}
            type="button"
            variant={mode === "automatic" ? "secondary" : "ghost"}
          >
            자동 트리거
          </Button>
          <Button
            onClick={() => setMode("manual")}
            type="button"
            variant={mode === "manual" ? "secondary" : "ghost"}
          >
            수동 트리거
          </Button>
        </div>
      ) : null}

      {!unlocked ? (
        <form className="space-y-4 p-5 sm:p-6" onSubmit={unlock}>
          <label className="block text-xs font-medium text-zinc-400" htmlFor="run-secret">
            운영 Secret
          </label>
          <input
            autoComplete="current-password"
            className="min-h-11 w-full rounded-md border border-white/10 bg-black/20 px-4 text-sm text-zinc-100 outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
            id="run-secret"
            onChange={(event) => setSecret(event.target.value)}
            placeholder="DEMO_TRIGGER_SECRET"
            type="password"
            value={secret}
          />
          <Button disabled={isUnlocking || !secret.trim()} type="submit">
            {isUnlocking ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
            운영 잠금 해제
          </Button>
        </form>
      ) : mode === "manual" && manualEmployees?.length ? (
        <ManualOrganizationRunForm
          employees={manualEmployees}
          onSessionExpired={() => {
            setUnlocked(false);
            setMode("automatic");
          }}
        />
      ) : (
        <div className="p-5 sm:p-6">
          <Button
            className="min-h-12 w-full text-sm"
            disabled={isRunning}
            onClick={runOrganization}
            type="button"
          >
            {isRunning ? <LoaderCircle className="animate-spin" /> : <Play />}
            {isRunning ? stages[stageIndex] : "AI 조직 1회 가동"}
          </Button>

          {isRunning ? (
            <ol className="mt-5 grid gap-2 sm:grid-cols-3">
              {stages.map((stage, index) => (
                <li
                  className={`rounded-md border px-3 py-2 text-xs ${
                    index <= stageIndex
                      ? "border-cyan-300/25 bg-cyan-300/[0.06] text-cyan-100"
                      : "border-white/8 text-zinc-600"
                  }`}
                  key={stage}
                >
                  {index + 1}. {stage}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      )}

      {mode === "automatic" ? (
        <div
          aria-live="polite"
          className="border-t border-white/8 px-5 py-5 sm:px-6"
        >
        {error ? (
          <div className="flex gap-3 rounded-md border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div>
              <p>{error}</p>
              {failureStage ? (
                <p className="mt-1 text-xs text-red-300/70">
                  실패 단계: {failureStage} · 미발행 상태
                </p>
              ) : null}
            </div>
          </div>
        ) : result ? (
          <div className="rounded-md border border-emerald-300/20 bg-emerald-300/[0.05] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <CheckCircle2 className="size-4" />
              {result.reviewPending ? "예외 검수 큐 이동" : "자동 발행 완료"}
            </div>
            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">생성 제목</dt>
                <dd className="mt-1 text-zinc-200">{result.title}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">게시판</dt>
                <dd className="mt-1 text-zinc-200">
                  {boardLabels[result.boardType]}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">참여 직원</dt>
                <dd className="mt-1 text-zinc-200">
                  {result.participants.map(({ name }) => name).join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Gemini 호출</dt>
                <dd className="mt-1 text-zinc-200">
                  {result.geminiCallCount}회
                </dd>
              </div>
            </dl>
            {result.publicUrl ? (
              <Button asChild className="mt-4" variant="outline">
                <Link href={result.publicUrl}>
                  공개 콘텐츠 보기
                  <ExternalLink />
                </Link>
              </Button>
            ) : (
              <p className="mt-4 text-xs text-amber-200">
                자동 공개가 보류되었습니다. 예외 검수 큐에서 확인해 주세요.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">
            실행 전에는 공개 콘텐츠가 생성되지 않습니다.
          </p>
        )}
        </div>
      ) : null}
    </section>
  );
}
