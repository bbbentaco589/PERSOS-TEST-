import type { ReactNode } from "react";

export function PrimaryMenuHero({
  label,
  title,
  description,
  visual,
  actions,
}: {
  label: string;
  title: ReactNode;
  description: ReactNode;
  visual?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="studio-grid border-b border-white/8 py-8 sm:py-10">
      <div
        className={
          visual
            ? "grid items-center gap-7 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10"
            : undefined
        }
      >
        <div>
          <div aria-label={`${label} Persona Operating System`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200">
              {label}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
              PERSONA OPERATING SYSTEM
            </p>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
          {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {visual ? <div className="min-w-0">{visual}</div> : null}
      </div>
    </section>
  );
}
