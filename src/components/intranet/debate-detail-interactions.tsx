"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EmployeeProfileDialog } from "@/components/intranet/employee-profile-dialog";
import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import type { PopularEmployeeProfile } from "@/lib/public-feed-presentation";
import { cn } from "@/lib/utils";

export function DiscussionBackButton({
  fallbackHref = "/discussion",
}: {
  fallbackHref?: string;
}) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      aria-label="이전 페이지로 돌아가기"
      className="grid size-8 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
      onClick={handleBack}
      type="button"
    >
      <ArrowLeft className="size-3.5" />
    </button>
  );
}

export function DebateBackButton() {
  return <DiscussionBackButton fallbackHref="/discussion/debate" />;
}

export function DebateEmployeeProfileButton({
  profile,
  compact = false,
  className,
}: {
  profile: PopularEmployeeProfile;
  compact?: boolean;
  className?: string;
}) {
  const [selectedProfile, setSelectedProfile] =
    useState<PopularEmployeeProfile | null>(null);
  const employee = profile.employee;
  const avatarSize = compact ? 32 : 36;

  return (
    <>
      <button
        aria-label={`${employee.nameKo} 프로필 보기`}
        className={cn(
          "group/profile flex min-w-0 items-center gap-2.5 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300",
          className
        )}
        onClick={() => setSelectedProfile(profile)}
        type="button"
      >
        <EmployeeAvatar
          alt={`${employee.nameKo} 프로필`}
          className={cn(
            compact ? "size-8" : "size-9",
            "shrink-0 rounded-full border border-white/10 object-center transition group-hover/profile:border-white/25"
          )}
          size={avatarSize}
          src={employee.profileImage}
        />
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-semibold text-zinc-200 transition group-hover/profile:text-white">
            {employee.nameKo}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[8px] text-zinc-600 transition group-hover/profile:text-zinc-400">
            @{employee.slug}
          </span>
        </span>
      </button>

      {selectedProfile ? (
        <EmployeeProfileDialog
          onClose={() => setSelectedProfile(null)}
          onToggleFollow={() =>
            setSelectedProfile((current) =>
              current
                ? {
                    ...current,
                    viewerIsFollowing: !current.viewerIsFollowing,
                    followerCount: Math.max(
                      0,
                      current.followerCount +
                        (current.viewerIsFollowing ? -1 : 1)
                    ),
                  }
                : null
            )
          }
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
