import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="studio-grid border-b border-white/8 py-8 sm:py-10">
      <Badge variant="accent">{eyebrow}</Badge>
      <h1 className="text-balance mt-5 max-w-4xl text-3xl font-semibold sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
        {description}
      </p>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
