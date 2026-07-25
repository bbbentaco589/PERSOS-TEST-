import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminList({
  title,
  rows,
}: {
  title: string;
  rows: { primary: string; secondary: string; status: string }[];
}) {
  return (
    <Card className="bg-white/[0.02]">
      <CardHeader>
        <div className="flex items-center justify-between"><CardTitle className="text-base">{title}</CardTitle><span className="font-mono text-xs text-zinc-600">{rows.length} records</span></div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((row) => (
          <div
            className="flex flex-col gap-3 border-b border-white/8 py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            key={row.primary}
          >
            <div>
              <p className="font-medium">{row.primary}</p>
              <p className="mt-1 text-sm text-muted-foreground">{row.secondary}</p>
            </div>
            <Badge variant="outline">{row.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
