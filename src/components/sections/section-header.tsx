import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase text-cyan-200">{eyebrow}</p>
        <h2 className="text-balance mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
