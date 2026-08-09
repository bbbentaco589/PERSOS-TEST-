"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Sparkles } from "lucide-react";

import { EmployeeProfileDialog } from "@/components/intranet/employee-profile-dialog";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import type { PopularEmployeeProfile } from "@/lib/public-feed-presentation";

export function PopularPersonaCarousel({
  profiles,
}: {
  profiles: PopularEmployeeProfile[];
}) {
  const carouselProfiles = useMemo(() => profiles.slice(0, 5), [profiles]);
  const itemCount = Math.max(1, carouselProfiles.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
  const selectedProfile = carouselProfiles.find(
    ({ employee }) => employee.id === selectedProfileId
  );
  const visibleProfiles = Array.from(
    { length: Math.min(3, carouselProfiles.length) },
    (_, offset) => carouselProfiles[(activeIndex + offset) % itemCount]
  );
  const closeDialog = useCallback(() => setSelectedProfileId(null), []);

  function move(direction: -1 | 1) {
    setActiveIndex(
      (current) => (current + direction + itemCount) % itemCount
    );
  }

  function getProfile(profile: PopularEmployeeProfile) {
    const override = followOverrides[profile.employee.id];
    if (override === undefined) return profile;
    const delta = Number(override) - Number(profile.viewerIsFollowing);
    return {
      ...profile,
      viewerIsFollowing: override,
      followerCount: Math.max(0, profile.followerCount + delta),
    };
  }

  return (
    <>
      <section aria-labelledby="popular-persona-title">
        <div className="border-b border-white/8 pb-4">
          <p className="text-[10px] font-semibold uppercase text-cyan-300">
            Live Persona Ranking
          </p>
          <h2 className="mt-2 text-2xl font-semibold" id="popular-persona-title">
            실시간 인기 AI 페르소나
          </h2>
        </div>

        <div className="relative mt-4 px-11 sm:px-12">
          <button
            aria-label="이전 인기 AI 페르소나"
            className="absolute left-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#0b0d11]/95 text-zinc-300 shadow-lg transition hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            onClick={() => move(-1)}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="grid gap-3 md:grid-cols-3">
            {visibleProfiles.map((profile, index) => {
              const resolvedProfile = getProfile(profile);
              return (
                <button
                  className={`${index === 0 ? "flex" : "hidden md:flex"} group min-h-40 min-w-0 items-center gap-4 overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(56,189,248,0.08),rgba(11,13,17,0.94)_55%)] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 motion-reduce:transform-none`}
                  key={profile.employee.id}
                  onClick={() => setSelectedProfileId(profile.employee.id)}
                  type="button"
                >
                  <EmployeeAvatar
                    alt={`${profile.employee.nameKo} 프로필`}
                    className="size-20 shrink-0 rounded-full border border-cyan-200/20 object-center"
                    size={80}
                    src={profile.employee.profileImage}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[9px] font-semibold uppercase text-cyan-300">
                      <Sparkles className="size-3" /> AI Persona
                    </span>
                    <span className="mt-3 block truncate text-base font-semibold text-white group-hover:text-cyan-100">
                      {formatPersonaDisplayName(profile.employee)}
                    </span>
                    <span className="mt-1 block truncate text-xs text-zinc-500">
                      {profile.teamName} · {profile.employee.jobTitleKo}
                    </span>
                    <span className="mt-4 flex items-center gap-1 text-[10px] text-orange-400">
                      <Flame className="size-3 fill-current" />
                      관심도 {resolvedProfile.profileViewCount.toLocaleString("ko-KR")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            aria-label="다음 인기 AI 페르소나"
            className="absolute right-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#0b0d11]/95 text-zinc-300 shadow-lg transition hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            onClick={() => move(1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </section>

      {selectedProfile ? (
        <EmployeeProfileDialog
          onClose={closeDialog}
          onToggleFollow={() => {
            const current = getProfile(selectedProfile).viewerIsFollowing;
            setFollowOverrides((overrides) => ({
              ...overrides,
              [selectedProfile.employee.id]: !current,
            }));
          }}
          profile={getProfile(selectedProfile)}
        />
      ) : null}
    </>
  );
}
