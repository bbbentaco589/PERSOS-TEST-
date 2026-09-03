import { employeeReactionPosts } from "@/data/employee-reaction-posts";
import { getOrganizationRunPublisher } from "@/lib/organization-run/kv-publisher";
import type { RepositoryBundle } from "@/lib/repositories/interfaces";
import { getRepositories } from "@/lib/repositories/repository-factory";
import type {
  EmployeeReactionBoard,
  EmployeeReactionPost,
  EmployeeReactionPostView,
} from "@/types";
import { normalizePublicFeedAuthorship } from "@/lib/organization-run/public-feed-interactions";

function clonePost(post: EmployeeReactionPost): EmployeeReactionPost {
  return normalizePublicFeedAuthorship({
    ...post,
    reactions: post.reactions.map((reaction) => ({ ...reaction })),
    replies: (post.replies ?? []).map((reply) => ({ ...reply })),
  });
}

async function listDynamicPosts(
  board?: Exclude<EmployeeReactionBoard, "investor-demo">
) {
  const publisher = getOrganizationRunPublisher();
  if (!publisher) return [];
  try {
    return await publisher.listPosts(board);
  } catch (error) {
    console.error(
      "[Employee reactions] KV read failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return [];
  }
}

async function listDynamicPostsByEmployeeId(employeeId: string) {
  const publisher = getOrganizationRunPublisher();
  if (!publisher) return [];
  try {
    if (publisher.listPostsByEmployeeId) {
      return await publisher.listPostsByEmployeeId(employeeId);
    }
    const posts = await publisher.listPosts();
    return posts.filter((post) => participatesInPost(post, employeeId));
  } catch (error) {
    console.error(
      "[Employee reactions] employee KV read failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return [];
  }
}

function participatesInPost(post: EmployeeReactionPost, employeeId: string) {
  return post.authorEmployeeId === employeeId ||
    post.reactions.some((reaction) => reaction.employeeId === employeeId) ||
    (post.replies ?? []).some((reply) => reply.employeeId === employeeId);
}

export async function listEmployeeReactionPosts(
  board?: Exclude<EmployeeReactionBoard, "investor-demo">
) {
  const dynamicPosts = await listDynamicPosts(board);
  return mergeEmployeeReactionPosts(
    employeeReactionPosts,
    dynamicPosts,
    board
  );
}

export async function listEmployeeReactionPostsByEmployeeId(employeeId: string) {
  const dynamicPosts = await listDynamicPostsByEmployeeId(employeeId);
  return mergeEmployeeReactionPosts(
    employeeReactionPosts.filter((post) => participatesInPost(post, employeeId)),
    dynamicPosts
  );
}

export function mergeEmployeeReactionPosts(
  fixturePosts: EmployeeReactionPost[],
  dynamicPosts: EmployeeReactionPost[],
  board?: Exclude<EmployeeReactionBoard, "investor-demo">
) {
  const merged = new Map<string, EmployeeReactionPost>();
  [...fixturePosts, ...dynamicPosts].forEach((post) => {
    if (board && post.board !== board) return;
    merged.set(post.slug, clonePost(post));
  });
  return [...merged.values()].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime()
  );
}

export async function getEmployeeReactionPostByBoard(
  board: Exclude<EmployeeReactionBoard, "investor-demo">
) {
  const posts = await listEmployeeReactionPosts(board);
  const post = posts.find((candidate) => candidate.board === board);
  return post ? clonePost(post) : undefined;
}

export async function getEmployeeReactionPostBySlug(
  slug: string
) {
  const posts = await listEmployeeReactionPosts();
  const post = posts.find((candidate) => candidate.slug === slug);
  return post ? clonePost(post) : undefined;
}

export async function listEmployeeReactionPostViews(
  repositories: RepositoryBundle = getRepositories()
) {
  const posts = await listEmployeeReactionPosts();
  return Promise.all(
    posts.map((post) => getEmployeeReactionPostView(post, repositories))
  );
}

export async function listEmployeeReactionPostViewsByBoard(
  board: Exclude<EmployeeReactionBoard, "investor-demo">,
  repositories: RepositoryBundle = getRepositories()
) {
  const posts = await listEmployeeReactionPosts(board);
  return Promise.all(
    posts.map((post) => getEmployeeReactionPostView(post, repositories))
  );
}

export async function getEmployeeReactionPostView(
  post: EmployeeReactionPost,
  repositories: RepositoryBundle = getRepositories()
): Promise<EmployeeReactionPostView> {
  const normalizedPost = normalizePublicFeedAuthorship(post);
  const employeeIds = [...new Set([
    ...normalizedPost.reactions.map((reaction) => reaction.employeeId),
    ...(normalizedPost.replies ?? []).map((reply) => reply.employeeId),
    ...(normalizedPost.authorEmployeeId
      ? [normalizedPost.authorEmployeeId]
      : []),
  ])];
  const employees = await Promise.all(
    employeeIds.map((employeeId) =>
      repositories.characters.getCharacterById(employeeId)
    )
  );
  const employeeById = new Map(
    employeeIds.map((employeeId, index) => [employeeId, employees[index]])
  );

  return {
    ...normalizedPost,
    author: normalizedPost.authorEmployeeId
      ? employeeById.get(normalizedPost.authorEmployeeId)
      : undefined,
    reactions: normalizedPost.reactions.map((reaction) => {
      const employee = employeeById.get(reaction.employeeId);
      if (!employee) {
        throw new Error(
          `${reaction.employeeId} Character Canonical을 찾지 못했습니다.`
        );
      }
      return { ...reaction, employee };
    }),
    replies: (normalizedPost.replies ?? []).map((reply) => {
      const employee = employeeById.get(reply.employeeId);
      if (!employee) {
        throw new Error(
          `${reply.employeeId} Character Canonical을 찾지 못했습니다.`
        );
      }
      return { ...reply, employee };
    }),
  };
}

export async function getEmployeeReactionPostViewByBoard(
  board: Exclude<EmployeeReactionBoard, "investor-demo">,
  repositories: RepositoryBundle = getRepositories()
) {
  const post = await getEmployeeReactionPostByBoard(board);
  return post
    ? getEmployeeReactionPostView(post, repositories)
    : undefined;
}

export async function getEmployeeReactionPostViewBySlug(
  slug: string,
  repositories: RepositoryBundle = getRepositories()
) {
  const post = await getEmployeeReactionPostBySlug(slug);
  return post
    ? getEmployeeReactionPostView(post, repositories)
    : undefined;
}
