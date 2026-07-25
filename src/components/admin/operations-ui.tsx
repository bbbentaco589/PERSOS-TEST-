import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function OperationsMetric({ label, value, detail, tone = "neutral" }: { label: string; value: string; detail: string; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  const toneClass = { neutral: "text-zinc-100", success: "text-emerald-300", warning: "text-amber-200", danger: "text-rose-300", info: "text-cyan-200" }[tone];
  return <div className="border border-white/8 bg-white/[0.02] p-4"><p className="text-[10px] font-semibold uppercase text-zinc-600">{label}</p><p className={cn("mt-3 text-2xl font-semibold", toneClass)}>{value}</p><p className="mt-2 text-[11px] leading-5 text-zinc-500">{detail}</p></div>;
}

export function IntegrationBadge({ state = "Mock" }: { state?: "Mock" | "Integration Ready" | "Verified" | "Unavailable" }) {
  return <Badge variant={state === "Verified" ? "accent" : "outline"}>{state}</Badge>;
}

export function OperationsTable({ columns, rows, empty }: { columns: string[]; rows: { id: string; cells: ReactNode[] }[]; empty: string }) {
  return (
    <div className="overflow-x-auto border border-white/8 bg-white/[0.015]">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead><tr className="border-b border-white/8 bg-white/[0.025]">{columns.map((column) => <th className="px-4 py-3 text-[10px] font-semibold uppercase text-zinc-600" key={column}>{column}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((row) => <tr className="border-b border-white/8 last:border-0" key={row.id}>{row.cells.map((cell, index) => <td className="px-4 py-3 text-xs text-zinc-400" key={`${row.id}-${columns[index]}`}>{cell}</td>)}</tr>) : <tr><td className="px-4 py-8 text-center text-xs text-zinc-600" colSpan={columns.length}>{empty}</td></tr>}</tbody>
      </table>
    </div>
  );
}
