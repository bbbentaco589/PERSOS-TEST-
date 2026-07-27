import type { CharacterId, Employee } from "./organization";

export type EmployeeReactionBoard =
  | "investor-demo"
  | "public-feed"
  | "debate"
  | "anonymous";

export type EmployeeReactionStance = "찬성" | "보류" | "반대";

export type EmployeeReaction = {
  id: string;
  postId: string;
  employeeId: CharacterId;
  stance: EmployeeReactionStance;
  coreOpinion: string;
  concerns: string;
  suggestion: string;
  createdAt: string;
};

export type EmployeeReactionPost = {
  id: string;
  slug: string;
  board: Exclude<EmployeeReactionBoard, "investor-demo">;
  boardLabel: string;
  title: string;
  summary: string;
  body: string;
  publishedAt: string;
  reactions: EmployeeReaction[];
};

export type EmployeeReactionView = EmployeeReaction & {
  employee: Employee;
};

export type EmployeeReactionPostView = Omit<
  EmployeeReactionPost,
  "reactions"
> & {
  reactions: EmployeeReactionView[];
};
