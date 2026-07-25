import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function MediaPlaceholder({
  className,
  label = "콘텐츠 썸네일 준비 중",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      aria-label={label}
      className={cn(
        "studio-grid grid aspect-[22/10] place-items-center border-b border-dashed border-white/10 bg-[#0a0d13]",
        className
      )}
      role="img"
    >
      <span className="flex items-center gap-2 text-[10px] text-zinc-600">
        <ImageIcon className="size-3.5" />
        {label}
      </span>
    </div>
  );
}
