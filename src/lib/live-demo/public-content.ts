import { getRepositories } from "@/lib/repositories";
import type {
  LiveDemoContentPlan,
  LiveDemoContentType,
  LiveDemoGeneratedContent,
} from "@/types";

export async function listPublishedLiveDemoContents(
  contentType?: LiveDemoContentType
): Promise<LiveDemoGeneratedContent[]> {
  try {
    return await getRepositories().liveDemo.listGeneratedContents({
      contentType,
      status: "published",
    });
  } catch {
    // Live Demo migration or external persistence failure must not break Public pages.
    return [];
  }
}

export async function getPublicLiveDemoPlan(): Promise<
  LiveDemoContentPlan | undefined
> {
  try {
    return await getRepositories().liveDemo.getActivePlan();
  } catch {
    return undefined;
  }
}
