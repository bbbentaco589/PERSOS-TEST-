"use client";

import { useCallback, useMemo, useState } from "react";

import { AnonymousChatRoom } from "@/components/intranet/anonymous-chat-room";
import {
  DiscussionArchivePanel,
  DiscussionPopularEmployeePanel,
} from "@/components/intranet/public-discussion-rail";
import type {
  PublicAnonymousChatDemo,
  PublicArchiveTopic,
} from "@/data/public-discussion-demo";
import type { PopularEmployeeProfile } from "@/lib/public-feed-presentation";

export function AnonymousDiscussionBoard({
  archiveItems,
  chat,
  popularEmployees,
}: {
  archiveItems: PublicArchiveTopic[];
  chat: PublicAnonymousChatDemo;
  popularEmployees: PopularEmployeeProfile[];
}) {
  const visibleArchiveItems = archiveItems.slice(0, 5);
  const [scrollRequestNonce, setScrollRequestNonce] = useState(0);
  const [followState, setFollowState] = useState<
    Record<string, { count: number; active: boolean }>
  >(() =>
    Object.fromEntries(
      popularEmployees.map((profile) => [
        profile.employee.id,
        {
          count: profile.followerCount,
          active: profile.viewerIsFollowing,
        },
      ])
    )
  );
  const interactiveProfiles = useMemo(
    () =>
      popularEmployees.map((profile) => ({
        ...profile,
        followerCount:
          followState[profile.employee.id]?.count ?? profile.followerCount,
        viewerIsFollowing:
          followState[profile.employee.id]?.active ??
          profile.viewerIsFollowing,
      })),
    [followState, popularEmployees]
  );
  const toggleFollow = useCallback((employeeId: string) => {
    setFollowState((current) => {
      const state = current[employeeId];
      if (!state) return current;

      return {
        ...current,
        [employeeId]: {
          active: !state.active,
          count: Math.max(0, state.count + (state.active ? -1 : 1)),
        },
      };
    });
  }, []);

  return (
    <div className="mt-6 grid gap-4 rounded-lg border border-yellow-300/15 bg-[#080d15] p-3 shadow-[0_18px_55px_rgba(0,0,0,0.22)] sm:p-4 min-[1120px]:grid-cols-[minmax(0,1fr)_300px]">
      <main className="min-w-0">
        <AnonymousChatRoom
          chat={chat}
          scrollRequestNonce={scrollRequestNonce}
        />
      </main>

      <aside
        aria-label="익명 채팅 보조 정보"
        className="space-y-4 min-[1120px]:sticky min-[1120px]:top-20 min-[1120px]:max-h-[calc(100vh-6rem)] min-[1120px]:self-start min-[1120px]:overflow-y-auto min-[1120px]:pr-1 min-[1120px]:[scrollbar-width:none] min-[1120px]:[&::-webkit-scrollbar]:hidden"
      >
        <DiscussionArchivePanel
          items={visibleArchiveItems}
          onSelectItem={() => setScrollRequestNonce(Date.now())}
          title="지난 주제"
          variant="anonymous"
        />
        <DiscussionPopularEmployeePanel
          onToggleFollow={toggleFollow}
          profiles={interactiveProfiles}
        />
      </aside>
    </div>
  );
}
