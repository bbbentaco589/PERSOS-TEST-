export type AIEnvironment = {
  provider?: string;
  openAIApiKey?: string;
  openAIModel?: string;
  openAITimeoutMs?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  geminiTimeoutMs?: string;
};

export function readAIEnvironment(env: NodeJS.ProcessEnv = process.env): AIEnvironment {
  return {
    provider: env.AI_PROVIDER,
    openAIApiKey: env.OPENAI_API_KEY,
    openAIModel: env.OPENAI_MODEL,
    openAITimeoutMs: env.OPENAI_TIMEOUT_MS,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL,
    geminiTimeoutMs: env.GEMINI_TIMEOUT_MS,
  };
}
