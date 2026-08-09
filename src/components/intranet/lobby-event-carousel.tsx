"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LobbyEventBanner } from "@/types/lobby-events";

function formatDate(value: string) {
  return value.replaceAll("-", ".");
}

function LobbyEventDialog({
  banner,
  onClose,
}: {
  banner: LobbyEventBanner;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        aria-label="공지사항 팝업 배경 닫기"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby="lobby-event-dialog-title"
        aria-modal="true"
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-xl border border-white/12 bg-[#0b0d12] shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:max-w-3xl sm:rounded-xl"
        ref={dialogRef}
        role="dialog"
      >
        <div className="relative aspect-[16/8] overflow-hidden border-b border-white/8 bg-black sm:aspect-[16/7]">
          <Image
            alt={`${banner.title} 배너 이미지`}
            className="object-cover"
            fill
            sizes="(max-width: 767px) 100vw, 768px"
            src={banner.imageUrl}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-black/20 to-black/10" />
          <Button
            aria-label="공지사항 팝업 닫기"
            className="absolute right-4 top-4 border-white/15 bg-black/60 backdrop-blur"
            onClick={onClose}
            ref={closeButtonRef}
            size="icon"
            type="button"
            variant="outline"
          >
            <X />
          </Button>
        </div>
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-[10px]">
            <span className="font-semibold uppercase text-cyan-300">
              {banner.eyebrow}
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600">
              <CalendarDays className="size-3" /> {formatDate(banner.publishedAt)}
            </span>
          </div>
          <h2
            className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl"
            id="lobby-event-dialog-title"
          >
            {banner.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            {banner.summary}
          </p>
          <div className="mt-7 whitespace-pre-line border-t border-white/8 pt-7 text-sm leading-8 text-zinc-300">
            {banner.body}
          </div>
          {banner.callToActionLabel && banner.callToActionHref ? (
            <Button asChild className="mt-7" size="lg">
              <Link href={banner.callToActionHref}>
                {banner.callToActionLabel}
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LobbyEventCarousel({
  banners,
}: {
  banners: LobbyEventBanner[];
}) {
  const carouselBanners = banners.slice(0, 5);
  const itemCount = Math.max(1, carouselBanners.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedBanner = carouselBanners.find((item) => item.id === selectedId);
  const activeBanner = carouselBanners[activeIndex % itemCount];
  const closeDialog = () => setSelectedId(null);

  function move(direction: -1 | 1) {
    setActiveIndex(
      (current) => (current + direction + itemCount) % itemCount
    );
  }

  return (
    <>
      <section aria-labelledby="lobby-event-title">
        <header className="mb-5 border-b border-white/8 pb-5">
          <p className="text-[10px] font-semibold uppercase text-cyan-200">
            PERSOS NOTICE &amp; EVENT
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold sm:text-3xl" id="lobby-event-title">
            페르소스(PERSOS) 인트라넷 공지사항
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            운영 공지, 협업 소식과 주요 이벤트를 배너로 안내합니다.
          </p>
        </header>

        {activeBanner ? (
          <div className="relative px-11 sm:px-12">
            <button
              aria-label="이전 공지 배너"
              className="absolute left-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#0b0d11]/95 text-zinc-300 shadow-lg transition hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
              onClick={() => move(-1)}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              aria-haspopup="dialog"
              className="group relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-black text-left transition hover:border-cyan-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 sm:aspect-[16/6]"
              onClick={() => setSelectedId(activeBanner.id)}
              type="button"
            >
              <Image
                alt={`${activeBanner.title} 이벤트 배너`}
                className="object-cover transition duration-700 group-hover:scale-[1.02] motion-reduce:transform-none"
                fill
                loading="eager"
                sizes="(max-width: 767px) calc(100vw - 80px), (max-width: 1279px) 75vw, 1000px"
                src={activeBanner.imageUrl}
                unoptimized
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,15,0.92)_0%,rgba(2,6,15,0.72)_45%,rgba(2,6,15,0.15)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:max-w-2xl sm:p-8">
                <span className="flex items-center gap-2 text-[9px] font-semibold uppercase text-cyan-300 sm:text-[10px]">
                  <Megaphone className="size-3.5" /> {activeBanner.eyebrow}
                </span>
                <h3 className="mt-3 text-balance text-lg font-semibold text-white sm:text-2xl">
                  {activeBanner.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-300 sm:text-sm sm:leading-6">
                  {activeBanner.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold text-white/75">
                  자세히 보기 <ArrowRight className="size-3.5" />
                </span>
              </div>
              <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[9px] text-zinc-300 backdrop-blur-sm">
                {activeIndex + 1} / {carouselBanners.length}
              </span>
            </button>

            <button
              aria-label="다음 공지 배너"
              className="absolute right-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#0b0d11]/95 text-zinc-300 shadow-lg transition hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
              onClick={() => move(1)}
              type="button"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-600">
            현재 공개 중인 공지 배너가 없습니다.
          </p>
        )}
      </section>

      {selectedBanner ? (
        <LobbyEventDialog banner={selectedBanner} onClose={closeDialog} />
      ) : null}
    </>
  );
}
