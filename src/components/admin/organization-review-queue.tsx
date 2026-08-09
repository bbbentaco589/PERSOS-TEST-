"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrganizationRunReviewItem } from "@/types";

export function OrganizationReviewQueue({
  initialItems,
  storageConfigured,
}: {
  initialItems: OrganizationRunReviewItem[];
  storageConfigured: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState("");

  function updateDraft(id: string, field: "title" | "body", value: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              title: field === "title" ? value : item.title,
              post: item.post
                ? { ...item.post, [field === "body" ? "body" : "title"]: value }
                : item.post,
            }
          : item
      )
    );
  }

  async function submit(item: OrganizationRunReviewItem, action: "approve" | "edit" | "discard") {
    setBusyId(item.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/organization-review/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          title: item.post?.title,
          contentBody: item.post?.body,
        }),
      });
      const data = (await response.json()) as { item?: OrganizationRunReviewItem; error?: string };
      if (!response.ok || !data.item) throw new Error(data.error || "검수 처리에 실패했습니다.");
      if (data.item.status === "review_pending") {
        setItems((current) => current.map((candidate) => candidate.id === item.id ? data.item! : candidate));
      } else {
        setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "검수 처리에 실패했습니다.");
    } finally {
      setBusyId(undefined);
    }
  }

  if (!storageConfigured) {
    return (
      <p className="border border-amber-300/20 bg-amber-300/5 p-5 text-sm text-amber-100">
        KV 저장소가 연결되지 않아 실제 예외 검수 큐를 조회할 수 없습니다.
      </p>
    );
  }

  if (!items.length) {
    return (
      <p className="border border-white/10 p-8 text-center text-sm text-zinc-500">
        Automated QA 실패 또는 고위험으로 보류된 콘텐츠가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-300" role="alert">{error}</p> : null}
      {items.map((item) => (
        <article className="border border-amber-300/15 bg-[#0b0d12] p-5" key={item.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{item.boardType}</Badge>
              <Badge
                className={item.riskLevel === "high" ? "border-rose-300/30 text-rose-200" : undefined}
                variant="outline"
              >
                {item.riskLevel === "high" ? "고위험" : "검수 필요"}
              </Badge>
            </div>
            <time className="text-[10px] text-zinc-600">{item.createdAt}</time>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-amber-100/80">
            {item.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
          {item.post ? (
            <div className="mt-5 space-y-3">
              <input
                aria-label="검수 콘텐츠 제목"
                className="w-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                onChange={(event) => updateDraft(item.id, "title", event.target.value)}
                value={item.post.title}
              />
              <textarea
                aria-label="검수 콘텐츠 본문"
                className="min-h-32 w-full resize-y border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-zinc-200 outline-none focus:border-cyan-300/50"
                onChange={(event) => updateDraft(item.id, "body", event.target.value)}
                value={item.post.body}
              />
            </div>
          ) : (
            <p className="mt-5 text-xs text-zinc-500">생성 결과가 없어 폐기 후 재실행이 필요합니다.</p>
          )}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {item.post ? (
              <>
                <Button disabled={busyId === item.id} onClick={() => submit(item, "edit")} size="sm" variant="outline">
                  <Save /> 수정 저장
                </Button>
                <Button disabled={busyId === item.id} onClick={() => submit(item, "approve")} size="sm">
                  <Check /> 승인·발행
                </Button>
              </>
            ) : null}
            <Button disabled={busyId === item.id} onClick={() => submit(item, "discard")} size="sm" variant="ghost">
              <Trash2 /> 폐기
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
