"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ImageIcon,
  LoaderCircle,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  LobbyEventBanner,
  LobbyEventBannerInput,
} from "@/types/lobby-events";

function todayInKorea() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function emptyForm(): LobbyEventBannerInput {
  return {
    eyebrow: "PERSOS NOTICE",
    title: "",
    summary: "",
    body: "",
    imageUrl: "",
    callToActionLabel: "",
    callToActionHref: "",
    publishedAt: todayInKorea(),
    active: true,
  };
}

export function LobbyEventManager({
  initialBanners,
  storageConfigured,
}: {
  initialBanners: LobbyEventBanner[];
  storageConfigured: boolean;
}) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState<LobbyEventBannerInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  }

  function editBanner(banner: LobbyEventBanner) {
    setEditingId(banner.id);
    setForm(banner);
    setError("");
    setMessage("");
  }

  async function saveBanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storageConfigured || isSaving) return;
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/lobby-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId ?? undefined }),
      });
      const data = (await response.json()) as {
        banners?: LobbyEventBanner[];
        error?: string;
      };
      if (!response.ok || !data.banners) {
        throw new Error(data.error || "배너를 저장하지 못했습니다.");
      }
      setBanners(data.banners);
      setMessage(editingId ? "배너 수정이 완료되었습니다." : "새 배너가 등록되었습니다.");
      resetForm();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "배너를 저장하지 못했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBanner(id: string) {
    if (
      !storageConfigured ||
      deletingId ||
      !window.confirm("이 공지 배너를 삭제할까요?")
    ) {
      return;
    }
    setDeletingId(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/lobby-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as {
        banners?: LobbyEventBanner[];
        error?: string;
      };
      if (!response.ok || !data.banners) {
        throw new Error(data.error || "배너를 삭제하지 못했습니다.");
      }
      setBanners(data.banners);
      if (editingId === id) resetForm();
      setMessage("배너가 삭제되었습니다.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "배너를 삭제하지 못했습니다."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-cyan-300/15 bg-[#0b0d11]">
      <header className="flex flex-col gap-4 border-b border-white/8 bg-cyan-300/[0.035] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Megaphone className="size-4 text-cyan-200" />
            로비 이벤트 배너
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            로비 공지사항 캐러셀과 클릭 팝업에 표시할 내용을 최대 5개까지 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={storageConfigured ? "accent" : "outline"}>
            {storageConfigured ? "KV 연결" : "읽기 전용 Fixture"}
          </Badge>
          <Badge variant="outline">{banners.length} / 5</Badge>
        </div>
      </header>

      <div className="grid gap-px bg-white/8 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <div className="bg-[#0b0d11] p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-200">현재 배너</h2>
          <div className="mt-4 space-y-3">
            {banners.map((banner) => (
              <article
                className="grid gap-3 rounded-md border border-white/8 bg-black/20 p-3 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center"
                key={banner.id}
              >
                <div className="relative aspect-[16/7] overflow-hidden rounded border border-white/8 bg-black">
                  <Image
                    alt={`${banner.title} 미리보기`}
                    className="object-cover"
                    fill
                    sizes="120px"
                    src={banner.imageUrl}
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-semibold text-cyan-300">
                      {banner.eyebrow}
                    </span>
                    <Badge variant={banner.active ? "accent" : "outline"}>
                      {banner.active ? "공개" : "숨김"}
                    </Badge>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-zinc-200">
                    {banner.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[9px] text-zinc-600">
                    <CalendarDays className="size-3" /> {banner.publishedAt}
                  </p>
                </div>
                <div className="flex gap-1 sm:flex-col">
                  <Button
                    aria-label={`${banner.title} 수정`}
                    onClick={() => editBanner(banner)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    aria-label={`${banner.title} 삭제`}
                    disabled={!storageConfigured || deletingId === banner.id}
                    onClick={() => deleteBanner(banner.id)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    {deletingId === banner.id ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!storageConfigured ? (
            <p className="mt-4 flex gap-2 rounded-md border border-amber-300/15 bg-amber-300/[0.04] p-3 text-[11px] leading-5 text-amber-100/70">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              현재 환경에는 KV 연결이 없어 기본 배너만 표시됩니다. 운영 환경의 Upstash 연결 시 작성·수정·삭제가 활성화됩니다.
            </p>
          ) : null}
        </div>

        <form className="space-y-5 bg-[#0b0d11] p-5 sm:p-6" onSubmit={saveBanner}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-200">
              {editingId ? "배너 수정" : "새 배너 작성"}
            </h2>
            {editingId ? (
              <Button onClick={resetForm} size="sm" type="button" variant="ghost">
                <X /> 새로 작성
              </Button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs text-zinc-400">
              분류
              <Input
                maxLength={40}
                onChange={(event) => setForm({ ...form, eyebrow: event.target.value })}
                placeholder="COLLABORATION"
                required
                value={form.eyebrow}
              />
            </label>
            <label className="space-y-2 text-xs text-zinc-400">
              게시일
              <Input
                onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
                required
                type="date"
                value={form.publishedAt}
              />
            </label>
          </div>

          <label className="block space-y-2 text-xs text-zinc-400">
            제목
            <Input
              maxLength={100}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="이벤트 또는 협업 공지 제목"
              required
              value={form.title}
            />
          </label>
          <label className="block space-y-2 text-xs text-zinc-400">
            배너 요약
            <Input
              maxLength={180}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
              placeholder="배너 이미지 위에 표시할 한 줄 요약"
              required
              value={form.summary}
            />
          </label>
          <label className="block space-y-2 text-xs text-zinc-400">
            팝업 본문
            <textarea
              className="min-h-36 w-full resize-y rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-3 focus:ring-cyan-300/15"
              maxLength={3000}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              placeholder="이미지 클릭 후 팝업에 표시할 상세 내용을 작성하세요."
              required
              value={form.body}
            />
          </label>
          <label className="block space-y-2 text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <ImageIcon className="size-3.5" /> 배너 이미지
            </span>
            <Input
              maxLength={1000}
              onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
              placeholder="https://... 또는 /assets/..."
              required
              value={form.imageUrl}
            />
            <span className="block text-[9px] text-zinc-600">
              https 이미지 URL 또는 기존 내부 Asset 경로를 지원합니다.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs text-zinc-400">
              이동 버튼 문구
              <Input
                maxLength={40}
                onChange={(event) => setForm({ ...form, callToActionLabel: event.target.value })}
                placeholder="자세히 보기"
                value={form.callToActionLabel ?? ""}
              />
            </label>
            <label className="space-y-2 text-xs text-zinc-400">
              이동 경로
              <Input
                maxLength={1000}
                onChange={(event) => setForm({ ...form, callToActionHref: event.target.value })}
                placeholder="/contact 또는 https://..."
                value={form.callToActionHref ?? ""}
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-md border border-white/8 bg-white/[0.02] p-3 text-xs text-zinc-300">
            <input
              checked={form.active}
              className="size-4 accent-cyan-300"
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
              type="checkbox"
            />
            로비 공지사항에 공개
          </label>

          <div aria-live="polite">
            {error ? (
              <p className="flex gap-2 text-xs text-red-300">
                <TriangleAlert className="size-4 shrink-0" /> {error}
              </p>
            ) : message ? (
              <p className="flex gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" /> {message}
              </p>
            ) : null}
          </div>

          <Button
            className="w-full"
            disabled={!storageConfigured || isSaving}
            size="lg"
            type="submit"
          >
            {isSaving ? <LoaderCircle className="animate-spin" /> : <Plus />}
            {editingId ? "배너 수정 저장" : "배너 등록"}
          </Button>
        </form>
      </div>
    </section>
  );
}
