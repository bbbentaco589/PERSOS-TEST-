import type { AIResponse, Character, CrossRebuttal, Source, Topic } from "@/types";

export const AIProviderName = {
  Mock: "mock",
  OpenAI: "openai",
  Gemini: "gemini",
} as const;

export type AIProviderName = (typeof AIProviderName)[keyof typeof AIProviderName];

export type InitialResponseOutput = {
  characterId: string;
  position: string;
  reasoning: string;
  response: string;
  sourceReferences: string[];
};

export type CrossRebuttalOutput = {
  responderCharacterId: string;
  targetCharacterId: string;
  rebuttal: string;
  acknowledgedPoint?: string;
  sourceReferences: string[];
};

export type ConsensusOutput = {
  summary: string;
  agreements: string[];
  disagreements: string[];
  finalConsensus: string;
  limitations: string[];
  sourceReferences: string[];
};

export type ContentDraftOutput = {
  title: string;
  summary: string;
  body: string;
  reviewNotes: string[];
};

export type InitialResponseInput = {
  topic: Topic;
  sources: Source[];
  character: Character;
  outputLanguage: "ko";
  lengthConstraint: string;
};

export type CrossRebuttalInput = {
  topic: Topic;
  sources: Source[];
  respondingCharacter: Character;
  targetCharacter: Character;
  respondingInitialResponse: AIResponse;
  targetResponse: AIResponse;
  outputLanguage: "ko";
  lengthConstraint: string;
};

export type ConsensusInput = {
  topic: Topic;
  sources: Source[];
  responses: AIResponse[];
  rebuttals: CrossRebuttal[];
  outputLanguage: "ko";
};

export type ContentDraftInput = {
  topic: Topic;
  sources: Source[];
  responses: AIResponse[];
  rebuttals: CrossRebuttal[];
  consensus: ConsensusOutput;
  targetContentType: "Web Article";
  outputLanguage: "ko";
};

export interface AIProvider {
  readonly name: AIProviderName;
  generateInitialResponse(input: InitialResponseInput): Promise<InitialResponseOutput>;
  generateCrossRebuttal(input: CrossRebuttalInput): Promise<CrossRebuttalOutput>;
  generateConsensus(input: ConsensusInput): Promise<ConsensusOutput>;
  generateContentDraft(input: ContentDraftInput): Promise<ContentDraftOutput>;
}

export type StructuredOutputRequest = {
  schemaName: string;
  schema: Record<string, unknown>;
  prompt: string;
};

export interface StructuredOutputExecutor {
  execute(request: StructuredOutputRequest): Promise<unknown>;
}
