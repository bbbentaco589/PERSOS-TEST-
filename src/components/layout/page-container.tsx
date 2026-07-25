import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-[1320px] flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-10", className)}>
      {children}
    </main>
  );
}
