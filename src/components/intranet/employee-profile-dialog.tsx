"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  BookOpenText,
  Eye,
  FileText,
  Flame,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";

import { EmployeeAvatar } from "@/components/organization/employee-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PopularEmployeeProfile } from "@/lib/public-feed-presentation";

export function EmployeeProfileDialog({
  profile,
  onClose,
  onToggleFollow,
}: {
  profile: PopularEmployeeProfile;
  onClose: () => void;
  onToggleFollow: () => void;
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
      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusableElements[0];
      const last = focusableElements.at(-1);

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

  const { employee } = profile;
  const runtimeStatus =
    employee.profileStage === "Approved"
      ? "Approved"
      : employee.slug === "tect"
        ? "Draft"
        : "Rough";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      data-testid="employee-profile-backdrop"
    >
      <button
        aria-label="프로필 팝업 배경 닫기"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby="employee-profile-dialog-title"
        aria-modal="true"
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-lg border border-white/12 bg-[#0b0d12] shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-xl sm:rounded-lg"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start gap-4 border-b border-white/8 p-5 sm:p-6">
          <EmployeeAvatar
            alt={`${employee.nameKo} 프로필`}
            className={
              employee.slug === "tect"
                ? "size-20 rounded-full object-[center_28%]"
                : "size-20 rounded-full"
            }
            size={80}
            src={employee.profileImage}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className="text-xl font-semibold text-white"
                id="employee-profile-dialog-title"
              >
                {employee.nameKo}
              </h2>
              <Badge
                className={
                  runtimeStatus === "Approved"
                    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                    : runtimeStatus === "Draft"
                      ? "border-violet-300/25 bg-violet-300/10 text-violet-200"
                      : "border-amber-300/20 bg-amber-300/[0.08] text-amber-200"
                }
                variant="outline"
              >
                {runtimeStatus}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">
              @{employee.slug}
            </p>
            <p className="mt-3 text-xs leading-6 text-zinc-400">
              {employee.summaryKo}
            </p>
          </div>
          <Button
            aria-label="프로필 팝업 닫기"
            className="shrink-0"
            onClick={onClose}
            ref={closeButtonRef}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </div>

        <div className="grid gap-px border-b border-white/8 bg-white/8 sm:grid-cols-3">
          <div className="bg-[#0b0d12] p-4">
            <p className="text-[9px] text-zinc-600">사업부</p>
            <p className="mt-1 text-xs text-zinc-300">{profile.divisionName}</p>
          </div>
          <div className="bg-[#0b0d12] p-4">
            <p className="text-[9px] text-zinc-600">소속 팀</p>
            <p className="mt-1 text-xs text-zinc-300">{profile.teamName}</p>
          </div>
          <div className="bg-[#0b0d12] p-4">
            <p className="text-[9px] text-zinc-600">직무</p>
            <p className="mt-1 text-xs text-zinc-300">{employee.jobTitleKo}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-white/8 sm:grid-cols-5">
          {[
            {
              icon: Eye,
              label: "프로필 조회",
              value: profile.profileViewCount,
            },
            {
              icon: profile.viewerIsFollowing ? UserCheck : UserPlus,
              label: "팔로워",
              value: profile.followerCount,
            },
            { icon: FileText, label: "작성 피드", value: profile.feedCount },
            {
              icon: Flame,
              label: "받은 Hype",
              value: profile.receivedHypeCount,
            },
            {
              icon: BookOpenText,
              label: "지식 기여",
              value: profile.knowledgeContributionCount,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              className="bg-[#0b0d12] p-4 last:col-span-2 sm:last:col-span-1"
              key={label}
            >
              <dt className="flex items-center gap-1.5 text-[9px] text-zinc-600">
                <Icon className="size-3" />
                {label}
              </dt>
              <dd className="mt-2 font-mono text-lg text-zinc-200">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
          <section aria-labelledby="recent-employee-activity-title">
            <h3
              className="text-xs font-semibold text-zinc-300"
              id="recent-employee-activity-title"
            >
              최근 활동
            </h3>
            {profile.recentActivities.length ? (
              <ul className="mt-3 space-y-2">
                {profile.recentActivities.map((activity) => (
                  <li key={activity.id}>
                    <Link
                      className="line-clamp-2 text-[11px] leading-5 text-zinc-500 transition hover:text-cyan-200"
                      href={activity.href}
                    >
                      {activity.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[11px] text-zinc-600">
                연결된 공개 활동이 없습니다.
              </p>
            )}
          </section>

          <section aria-labelledby="related-employee-knowledge-title">
            <h3
              className="text-xs font-semibold text-zinc-300"
              id="related-employee-knowledge-title"
            >
              관련 Knowledge
            </h3>
            {profile.relatedKnowledge.length ? (
              <ul className="mt-3 space-y-2">
                {profile.relatedKnowledge.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      className="line-clamp-2 text-[11px] leading-5 text-zinc-500 transition hover:text-cyan-200"
                      href={entry.href}
                    >
                      {entry.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[11px] text-zinc-600">
                연결된 공개 지식이 없습니다.
              </p>
            )}
          </section>
        </div>

        <div className="border-t border-white/8 p-5 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              aria-pressed={profile.viewerIsFollowing}
              onClick={onToggleFollow}
              size="lg"
              type="button"
              variant={profile.viewerIsFollowing ? "secondary" : "outline"}
            >
              {profile.viewerIsFollowing ? <UserCheck /> : <UserPlus />}
              {profile.viewerIsFollowing ? "Following" : "Follow"}
            </Button>
            <Button asChild size="lg">
              <Link href={`/characters/${employee.slug}`}>
                전체 프로필 보기
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-center text-[9px] text-zinc-700">
            조회·Hype·Follow 수는 Analytics 연결 전 Demo Metric입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
