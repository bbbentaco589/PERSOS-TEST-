import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RoadmapPhase } from "@/types";

export function Timeline({ phases }: { phases: RoadmapPhase[] }) {
  return (
    <div className="grid gap-4">
      {phases.map((phase) => (
        <Card key={phase.id}>
          <CardContent className="grid gap-4 p-5 md:grid-cols-[180px_1fr]">
            <div>
              <Badge variant={phase.status === "Now" ? "accent" : "outline"}>{phase.phase}</Badge>
              <p className="mt-3 text-sm text-muted-foreground">{phase.timeframe}</p>
            </div>
            <div>
              <h3 className="font-semibold">{phase.title}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {phase.milestones.map((milestone) => (
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" key={milestone}>
                    {milestone}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
