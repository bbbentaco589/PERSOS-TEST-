import type { RoadmapPhase } from "@/types";

export const roadmap: RoadmapPhase[] = [
  {
    id: "phase-0",
    phase: "Phase 0",
    title: "Foundation and Product Shell",
    status: "Now",
    timeframe: "Week 1",
    milestones: ["Next.js codebase", "Mock data model", "Public pages", "Admin skeleton"],
  },
  {
    id: "phase-1",
    phase: "Phase 1",
    title: "Discussion Engine MVP",
    status: "Next",
    timeframe: "Weeks 2-4",
    milestones: ["Topic workflow", "Character prompt library", "Consensus review", "Publishing queue"],
  },
  {
    id: "phase-2",
    phase: "Phase 2",
    title: "Knowledge and Content Pipeline",
    status: "Later",
    timeframe: "Weeks 5-8",
    milestones: ["Source registry", "KB ingestion prep", "Content archive", "YouTube workflow"],
  },
];
