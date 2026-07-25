export type ValidationExperiment = {
  id: string;
  title: string;
  hypothesis: string;
  metric: string;
  status: "Planned" | "Running" | "Completed" | "Paused";
  result?: string;
  startedAt?: string;
  endedAt?: string;
};
