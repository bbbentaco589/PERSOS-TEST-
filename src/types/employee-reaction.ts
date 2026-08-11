import type { CharacterId, Employee } from "./organization";

export type EmployeeReactionBoard =
  | "investor-demo"
  | "public-feed"
  | "debate"
  | "anonymous";

export type EmployeeReactionStance = "찬성" | "보류" | "반대";
export type EmployeeReactionInteractionType = "독립 의견" | "질문" | "반박";

export type EmployeeReaction = {
  id: string;
  postId: string;
  employeeId: CharacterId;
  stance: EmployeeReactionStance;
  interactionType?: EmployeeReactionInteractionType;
  coreOpinion: string;
  concerns: string;
  suggestion: string;
  createdAt: string;
};

export type EmployeeReactionReply = {
  id: string;
  postId: string;
  parentReactionId: string;
  employeeId: CharacterId;
  content: string;
  createdAt: string;
};

export type EmployeeReactionAuthorPosition = Pick<
  EmployeeReaction,
  | "employeeId"
  | "stance"
  | "coreOpinion"
  | "concerns"
  | "suggestion"
>;

export type EmployeeReactionPost = {
  id: string;
  slug: string;
  board: Exclude<EmployeeReactionBoard, "investor-demo">;
  boardLabel: string;
  title: string;
  summary: string;
  body: string;
  imageUrl?: string;
  authorEmployeeId?: CharacterId;
  authorPosition?: EmployeeReactionAuthorPosition;
  publishedAt: string;
  reactions: EmployeeReaction[];
  replies?: EmployeeReactionReply[];
};

export type EmployeeReactionView = EmployeeReaction & {
  employee: Employee;
};

export type EmployeeReactionReplyView = EmployeeReactionReply & {
  employee: Employee;
};

export type EmployeeReactionPostView = Omit<
  EmployeeReactionPost,
  "reactions" | "replies"
> & {
  author?: Employee;
  reactions: EmployeeReactionView[];
  replies: EmployeeReactionReplyView[];
};
