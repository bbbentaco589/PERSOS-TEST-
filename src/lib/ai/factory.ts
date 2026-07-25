import { getAIConfig } from "./config";
import { MockAIProvider } from "./mock/mock-ai-provider";
import type { AIProvider } from "./types";
import { AIProviderName } from "./types";

const mockProvider = new MockAIProvider();
let openAIProvider: AIProvider | null = null;
let geminiProvider: AIProvider | null = null;

export async function getAIProvider(
  env: NodeJS.ProcessEnv = process.env
): Promise<AIProvider> {
  const config = getAIConfig(env);
  if (config.provider === AIProviderName.Mock) return mockProvider;

  if (config.provider === AIProviderName.Gemini) {
    if (!geminiProvider) {
      const { createGeminiProvider } = await import("./gemini/gemini-ai-provider");
      geminiProvider = createGeminiProvider(config);
    }
    return geminiProvider;
  }

  if (!openAIProvider) {
    const { createOpenAIProvider } = await import("./openai/openai-ai-provider");
    openAIProvider = createOpenAIProvider(config);
  }
  return openAIProvider;
}
