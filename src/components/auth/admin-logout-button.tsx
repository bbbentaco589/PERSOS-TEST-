"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminLogoutButton({
  className,
  nextPath,
}: {
  className?: string;
  nextPath: "/admin" | "/investor-demo";
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function logout() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch("/api/admin-auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      window.location.assign(
        `/admin-login?next=${encodeURIComponent(nextPath)}`
      );
    }
  }

  return (
    <Button
      aria-label="관리자 로그아웃"
      className={cn("text-zinc-400 hover:text-white", className)}
      disabled={isSubmitting}
      onClick={logout}
      size="sm"
      type="button"
      variant="ghost"
    >
      <LogOut />
      <span className="hidden sm:inline">
        {isSubmitting ? "로그아웃 중" : "로그아웃"}
      </span>
    </Button>
  );
}
