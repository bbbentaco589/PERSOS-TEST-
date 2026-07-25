export type RoadmapPhase = {
  id: string;
  phase: string;
  title: string;
  status: "Now" | "Next" | "Later";
  timeframe: string;
  milestones: string[];
};
