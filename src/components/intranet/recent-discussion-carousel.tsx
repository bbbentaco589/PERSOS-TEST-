"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";

export type RecentDiscussionItem = {
  id: string;
  category: "debate" | "public" | "anonymous";
  boardLabel: string;
  title: string;
  href: string;
  image: string;
  publishedAt: string;
  author: {
    name: string;
    profileImage: string;
  };
};

const categoryIcons = {
  debate: DebateBoardIcon,
  public: PublicFeedAiSocialIcon,
  anonymous: AnonymousChatMaskIcon,
};

function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setItemsPerPage(query.matches ? 3 : 1);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return itemsPerPage;
}

export function RecentDiscussionCarousel({
  items,
}: {
  items: RecentDiscussionItem[];
}) {
  const itemsPerPage = useItemsPerPage();
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const pages = useMemo(
    () =>
      Array.from({ length: pageCount }, (_, index) =>
        items.slice(index * itemsPerPage, (index + 1) * itemsPerPage)
      ),
    [items, itemsPerPage, pageCount]
  );
  const activePage = page % pageCount;

  const move = (direction: -1 | 1) => {
    setPage((current) =>
      ((current % pageCount) + direction + pageCount) % pageCount
    );
  };

  return (
    <section aria-labelledby="company-recent-activity-title">
      <div className="flex items-end justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase text-cyan-300">
            Recent Posts
          </p>
          <h2
            className="mt-2 text-2xl font-semibold"
            id="company-recent-activity-title"
          >
            최근 게시물
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-[10px] text-zinc-600">
            {activePage + 1} / {pageCount}
          </span>
          <button
            aria-label="이전 최근 게시물"
            className="grid size-9 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:border-white/25 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            onClick={() => move(-1)}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="다음 최근 게시물"
            className="grid size-9 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:border-white/25 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            onClick={() => move(1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        aria-live="polite"
        className="grid gap-3 pt-4 md:grid-cols-3"
        key={`${itemsPerPage}-${activePage}`}
      >
        {pages[activePage]?.map((item) => {
          const CategoryIcon = categoryIcons[item.category];
          return (
            <Link
              className="group min-w-0 overflow-hidden rounded-lg border border-white/10 bg-[#0b0d11] transition hover:-translate-y-0.5 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 motion-reduce:transform-none"
              href={item.href}
              key={item.id}
            >
              <div className="relative aspect-[16/9] overflow-hidden border-b border-white/8 bg-black">
                <Image
                  alt={`${item.boardLabel} 대표 이미지`}
                  className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
                  fill
                  sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 30vw, 340px"
                  src={item.image}
                />
                <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-md border border-white/15 bg-black/70 shadow-lg backdrop-blur-sm">
                  <CategoryIcon aria-hidden="true" className="size-7" />
                </span>
              </div>
              <div className="p-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Image
                    alt={`${item.author.name} 프로필`}
                    className="size-7 shrink-0 rounded-full border border-white/10 bg-black object-cover object-center"
                    height={28}
                    src={item.author.profileImage}
                    width={28}
                  />
                  <span className="truncate text-[11px] font-medium text-zinc-300">
                    {item.author.name}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 min-h-11 text-sm font-semibold leading-[1.4rem] text-zinc-100 transition group-hover:text-cyan-100">
                  {item.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
