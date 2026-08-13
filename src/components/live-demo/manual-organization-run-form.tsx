"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  Send,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  EmployeeReactionStance,
  OrganizationRunBoardType,
} from "@/types";
import { cn } from "@/lib/utils";
import {
  MAX_ORGANIZATION_RUN_PARTICIPANTS,
  MIN_ORGANIZATION_RUN_PARTICIPANTS,
} from "@/lib/organization-run/policy";

export type ManualOrganizationRunEmployee = {
  id: string;
  name: string;
  jobTitle: string;
  profileImage: string;
};

type ManualRunResult = {
  status: "completed";
  title: string;
  boardType: OrganizationRunBoardType;
  imageUrl?: string;
  published: boolean;
  reviewPending: boolean;
  requestedPublish: boolean;
  publicUrl?: string;
  geminiCallCount: number;
  reactions: Array<{
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    stance: EmployeeReactionStance;
    coreOpinion: string;
    concerns: string;
    suggestion: string;
  }>;
};

const boardOptions: Array<{
  value: OrganizationRunBoardType;
  label: string;
}> = [
  { value: "public", label: "전사원 공개 피드" },
  { value: "debate", label: "전사원 찬반 토론" },
  { value: "anonymous", label: "전사원 익명 채팅" },
];

const stanceClass: Record<EmployeeReactionStance, string> = {
  찬성: "border-blue-300/25 bg-blue-300/10 text-blue-100",
  보류: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  반대: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

export function ManualOrganizationRunForm({
  employees,
  onSessionExpired,
}: {
  employees: ManualOrganizationRunEmployee[];
  onSessionExpired: () => void;
}) {
  const [boardType, setBoardType] =
    useState<OrganizationRunBoardType>("public");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [employeeIds, setEmployeeIds] = useState<string[]>(() =>
    employees
      .slice(0, MAX_ORGANIZATION_RUN_PARTICIPANTS)
      .map((employee) => employee.id)
  );
  const [publish, setPublish] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ManualRunResult>();

  const canSubmit = useMemo(
    () =>
      title.trim().length >= 12 &&
      body.trim().length >= 80 &&
      employeeIds.length >= MIN_ORGANIZATION_RUN_PARTICIPANTS &&
      employeeIds.length <= MAX_ORGANIZATION_RUN_PARTICIPANTS &&
      !isRunning,
    [body, employeeIds.length, isRunning, title]
  );

  function toggleEmployee(employeeId: string) {
    setEmployeeIds((current) => {
      if (current.includes(employeeId)) {
        return current.filter((id) => id !== employeeId);
      }
      if (current.length >= MAX_ORGANIZATION_RUN_PARTICIPANTS) return current;
      return [...current, employeeId];
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setIsRunning(true);
    setError("");
    setResult(undefined);

    try {
      const response = await fetch("/api/organization-run/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardType,
          title,
          body,
          imageUrl,
          employeeIds,
          publish,
        }),
      });
      const data = (await response.json()) as ManualRunResult & {
        error?: string;
      };
      if (!response.ok || data.status !== "completed") {
        if (response.status === 401) onSessionExpired();
        throw new Error(data.error || "수동 AI 조직 실행에 실패했습니다.");
      }
      setResult({ ...data, requestedPublish: publish });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "수동 AI 조직 실행에 실패했습니다."
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <form className="space-y-6 p-5 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-xs font-medium text-zinc-400">
          게시판
          <select
            className="min-h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300/40"
            onChange={(event) =>
              setBoardType(event.target.value as OrganizationRunBoardType)
            }
            value={boardType}
          >
            {boardOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-medium text-zinc-400">
          이미지 URL <span className="text-zinc-600">(선택)</span>
          <span className="relative block">
            <ImagePlus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
            <input
              className="min-h-11 w-full rounded-md border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-zinc-100 outline-none focus:border-cyan-300/40"
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://... 또는 /assets/..."
              inputMode="url"
              type="text"
              value={imageUrl}
            />
          </span>
        </label>
      </div>

      <label className="block space-y-2 text-xs font-medium text-zinc-400">
        주제 제목
        <input
          className="min-h-11 w-full rounded-md border border-white/10 bg-black/20 px-4 text-sm text-zinc-100 outline-none focus:border-cyan-300/40"
          maxLength={120}
          minLength={12}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="12~120자로 작성"
          required
          value={title}
        />
        <span className="block text-right text-[10px] text-zinc-600">
          {title.length}/120
        </span>
      </label>

      <label className="block space-y-2 text-xs font-medium text-zinc-400">
        본문
        <textarea
          className="min-h-40 w-full resize-y rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none focus:border-cyan-300/40"
          maxLength={1800}
          minLength={80}
          onChange={(event) => setBody(event.target.value)}
          placeholder="직원들이 검토할 안건의 배경, 판단 기준과 질문을 80~1,800자로 작성"
          required
          value={body}
        />
        <span className="block text-right text-[10px] text-zinc-600">
          {body.length}/1,800
        </span>
      </label>

      <fieldset>
        <div className="flex items-center justify-between gap-3">
          <legend className="text-xs font-medium text-zinc-400">
            호출 직원
          </legend>
          <span className="text-[10px] text-zinc-600">
            2~6명 선택 · {employeeIds.length}명
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {employees.map((employee) => {
            const selected = employeeIds.includes(employee.id);
            return (
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 transition",
                  selected
                    ? "border-cyan-300/30 bg-cyan-300/[0.07]"
                    : "border-white/8 bg-black/10 hover:border-white/15"
                )}
                key={employee.id}
              >
                <input
                  checked={selected}
                  className="sr-only"
                  onChange={() => toggleEmployee(employee.id)}
                  type="checkbox"
                />
                <Image
                  alt={`${employee.name} 프로필`}
                  className="size-9 rounded-full object-cover"
                  height={36}
                  src={employee.profileImage}
                  width={36}
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-zinc-200">
                    {employee.name}
                  </span>
                  <span className="mt-1 block truncate text-[9px] text-zinc-600">
                    {employee.jobTitle}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-white/8 bg-black/10 p-4">
        <input
          checked={publish}
          className="mt-0.5 size-4 accent-cyan-300"
          onChange={(event) => setPublish(event.target.checked)}
          type="checkbox"
        />
        <span>
          <span className="block text-xs font-semibold text-zinc-200">
            검증 통과 후 즉시 발행
          </span>
          <span className="mt-1 block text-[10px] leading-5 text-zinc-600">
            해제하면 생성 결과를 미발행 초안으로 검수 대기함에 저장합니다. 승인 전에는 외부에 노출되지 않습니다.
          </span>
        </span>
      </label>

      <Button className="min-h-12 w-full" disabled={!canSubmit} type="submit">
        {isRunning ? <LoaderCircle className="animate-spin" /> : <Send />}
        {isRunning
          ? "직원 반응 생성 및 검증 중"
          : publish
            ? "직원 반응 생성·검증 후 발행"
            : "직원 반응 생성·검증"}
      </Button>

      <div aria-live="polite">
        {error ? (
          <div className="flex gap-3 rounded-md border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : result ? (
          <section className="space-y-4 rounded-md border border-emerald-300/20 bg-emerald-300/[0.04] p-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <CheckCircle2 className="size-4" />
                  {result.reviewPending
                    ? result.requestedPublish
                      ? "예외 검수 큐 이동"
                      : "검증 완료 · 검수 대기함에 초안 저장"
                    : result.published
                      ? "검증 및 자동 발행 완료"
                      : "검증 완료 · 미발행 초안 저장"}
                </p>
                <p className="mt-1 text-[10px] text-zinc-500">
                  Gemini {result.geminiCallCount}회 ·{" "}
                  {
                    boardOptions.find(
                      (option) => option.value === result.boardType
                    )?.label
                  }
                </p>
              </div>
              {result.publicUrl ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={result.publicUrl}>
                    공개 콘텐츠 보기
                    <ExternalLink />
                  </Link>
                </Button>
              ) : null}
            </header>
            <div className="grid gap-3">
              {result.reactions.map((reaction) => (
                <article
                  className="rounded-md border border-white/8 bg-black/20 p-4"
                  key={reaction.employeeId}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">
                        {reaction.employeeName}
                      </h3>
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {reaction.jobTitle}
                      </p>
                    </div>
                    <Badge
                      className={stanceClass[reaction.stance]}
                      variant="outline"
                    >
                      {reaction.stance}
                    </Badge>
                  </div>
                  <dl className="mt-4 grid gap-4 text-xs lg:grid-cols-3">
                    <div>
                      <dt className="font-semibold text-zinc-500">핵심 의견</dt>
                      <dd className="mt-2 leading-6 text-zinc-300">
                        {reaction.coreOpinion}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">우려 사항</dt>
                      <dd className="mt-2 leading-6 text-zinc-300">
                        {reaction.concerns}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">제안</dt>
                      <dd className="mt-2 leading-6 text-zinc-300">
                        {reaction.suggestion}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </form>
  );
}
