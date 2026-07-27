"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  LoaderCircle,
  Send,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type EmployeeReaction = {
  employeeId: "tect" | "char-003" | "char-002";
  name: string;
  role: string;
  profileImage: string;
  divisionName: string;
  teamName: string;
  stance: "찬성" | "보류" | "반대";
  coreOpinion: string;
  concerns: string;
  suggestion: string;
};

type ReactionResponse = {
  reactions?: EmployeeReaction[];
  error?: string;
};

const stanceStyles = {
  찬성: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  보류: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  반대: "border-red-300/30 bg-red-300/10 text-red-200",
} as const;

export function EmployeeReactionTest() {
  const [message, setMessage] = useState("");
  const [reactions, setReactions] = useState<EmployeeReaction[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setIsLoading(true);
    setReactions([]);
    setError("");

    try {
      const request = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const result = (await request.json()) as ReactionResponse;

      if (
        !request.ok ||
        !Array.isArray(result.reactions) ||
        result.reactions.length !== 3
      ) {
        throw new Error(result.error || "응답을 불러오지 못했습니다.");
      }

      setReactions(result.reactions);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gemini 요청 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="employee-reaction-test-title"
      className="overflow-hidden rounded-md border border-white/10 bg-[#0b0d11]"
    >
      <div className="border-b border-white/8 bg-white/[0.025] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200">
            <UsersRound className="size-4" />
          </span>
          <div>
            <h2
              className="text-sm font-semibold text-zinc-100"
              id="employee-reaction-test-title"
            >
              PERSOS 직원 3인 반응
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              TECT, 루미, 박봉남이 Character Canonical에 따라 검토합니다.
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
        <label className="block text-xs font-medium text-zinc-400" htmlFor="review-agenda">
          검토 안건
        </label>
        <textarea
          className="min-h-32 w-full resize-y rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
          disabled={isLoading}
          id="review-agenda"
          maxLength={4_000}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="예: PERSOS에 유료 AI 직원 구독 모델을 도입하려고 한다."
          value={message}
        />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs tabular-nums text-zinc-600">
            {message.length.toLocaleString("ko-KR")} / 4,000
          </span>
          <Button disabled={isLoading || !message.trim()} type="submit">
            {isLoading ? (
              <>
                <LoaderCircle className="animate-spin" />
                직원 의견 생성 중
              </>
            ) : (
              <>
                <Send />
                직원 반응 확인
              </>
            )}
          </Button>
        </div>
      </form>

      <div aria-live="polite" className="border-t border-white/8 px-5 py-5 sm:px-6">
        {isLoading ? (
          <div className="flex min-h-28 items-center justify-center gap-3 text-sm text-zinc-500">
            <LoaderCircle className="size-4 animate-spin text-cyan-200" />
            세 직원의 관점을 생성하고 있습니다.
          </div>
        ) : error ? (
          <div className="flex min-h-28 items-start gap-3 rounded-md border border-red-400/20 bg-red-400/[0.05] p-4 text-sm leading-6 text-red-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : reactions.length === 3 ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {reactions.map((reaction) => {
              return (
                <article
                  className="overflow-hidden rounded-md border border-white/10 bg-black/15"
                  key={reaction.employeeId}
                >
                  <header className="border-b border-white/8 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Image
                          alt={`${reaction.name} 프로필`}
                          className="size-10 shrink-0 rounded-full border border-white/10 object-cover"
                          height={40}
                          src={reaction.profileImage}
                          width={40}
                        />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-zinc-100">
                            {reaction.name}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            {reaction.role}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                            {reaction.divisionName} · {reaction.teamName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${stanceStyles[reaction.stance]}`}
                      >
                        {reaction.stance}
                      </span>
                    </div>
                  </header>
                  <div className="divide-y divide-white/8 px-4">
                    {[
                      ["핵심 의견", reaction.coreOpinion],
                      ["우려 사항", reaction.concerns],
                      ["제안", reaction.suggestion],
                    ].map(([label, content]) => (
                      <section className="py-4" key={label}>
                        <h4 className="text-[11px] font-semibold text-zinc-500">
                          {label}
                        </h4>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                          {content}
                        </p>
                      </section>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-28 items-center justify-center text-sm text-zinc-600">
            안건을 입력하면 세 직원의 반응이 카드로 표시됩니다.
          </div>
        )}
      </div>
    </section>
  );
}
