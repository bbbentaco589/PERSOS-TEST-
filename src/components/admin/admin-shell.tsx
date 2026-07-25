import type { ReactNode } from "react";

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="space-y-6">
        <div className="border-b border-white/8 pb-5">
          <p className="text-[10px] font-semibold uppercase text-cyan-200">ARCHITECT OPERATIONS CONSOLE</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
