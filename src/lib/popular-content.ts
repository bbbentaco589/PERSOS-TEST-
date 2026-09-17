import "server-only";

import { unstable_cache } from "next/cache";

import {
  rankPopularContentsByAIComments,
  type PopularContent,
} from "@/lib/public-discovery";
import { listEmployeeReactionPosts } from "@/lib/repositories";

const POPULAR_CONTENT_CANDIDATE_LIMIT = 30;
const POPULAR_CONTENT_CACHE_SECONDS = 15 * 60;

const getCachedPopularContents = unstable_cache(
  async () => {
    const posts = await listEmployeeReactionPosts(
      undefined,
      POPULAR_CONTENT_CANDIDATE_LIMIT
    );
    return rankPopularContentsByAIComments(posts);
  },
  ["popular-contents-by-ai-comments-v1"],
  { revalidate: POPULAR_CONTENT_CACHE_SECONDS }
);

export async function getPopularContents(): Promise<PopularContent[]> {
  return getCachedPopularContents();
}
