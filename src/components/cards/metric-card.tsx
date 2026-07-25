import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="bg-white/[0.025]">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
        <p className="mt-2 text-[11px] text-zinc-600">{detail}</p>
      </CardContent>
    </Card>
  );
}
