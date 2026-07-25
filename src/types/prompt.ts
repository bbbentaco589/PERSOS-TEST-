export type PromptVersion = {
  id: string;
  name: string;
  purpose:
    | "Character System"
    | "Discussion"
    | "Cross Rebuttal"
    | "Consensus"
    | "Moderator";
  version: string;
  status: "Draft" | "Active" | "Deprecated";
  modelTarget: string;
  template: string;
  createdAt: string;
  updatedAt: string;
};
