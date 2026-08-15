"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(body?.error ?? "로그인에 실패했습니다.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("로그인 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-xs font-medium text-zinc-300"
          htmlFor="admin-password"
        >
          접근 코드
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            autoComplete="current-password"
            autoFocus
            className="h-11 pl-10"
            id="admin-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="승인된 코드를 입력하세요"
            required
            type="password"
            value={password}
          />
        </div>
      </div>
      <p
        aria-live="polite"
        className="min-h-5 text-xs leading-5 text-rose-300"
        role="status"
      >
        {error}
      </p>
      <Button className="h-10 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            확인 중
          </>
        ) : (
          <>
            접근 권한 확인
            <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
