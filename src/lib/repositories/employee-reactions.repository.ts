import { employeeReactionPosts } from "@/data/employee-reaction-posts";
import { getOrganizationRunPublisher } from "@/lib/organization-run/kv-publisher";
import type { RepositoryBundle } from "@/lib/repositories/interfaces";
import { getRepositories } from "@/lib/repositories/repository-factory";
import type {
  EmployeeReactionBoard,
  EmployeeReactionPost,
  EmployeeReactionPostView,
} from "@/types";

function clonePost(post: EmployeeReactionPost): EmployeeReactionPost {
  return {
    ...post,
    reactions: post.reactions.map((reaction) => ({ ...reaction })),
  };
}

async function listDynamicPosts() {
  const publisher = getOrganizationRunPublisher();
  if (!publisher) return [];
  try {
    return await publisher.listPosts();
  } catch (error) {
    console.error(
      "[Employee reactions] KV read failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return [];
  }
}

export async function listEmployeeReactionPosts() {
  const dynamicPosts = await listDynamicPosts();
  const merged = new Map<string, EmployeeReactionPost>();
  [...employeeReactionPosts, ...dynamicPosts].forEach((post) => {
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
  const posts = await listEmployeeReactionPosts();
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

export async function getEmployeeReactionPostView(
  post: EmployeeReactionPost,
  repositories: RepositoryBundle = getRepositories()
): Promise<EmployeeReactionPostView> {
  const employees = await Promise.all(
    post.reactions.map((reaction) =>
      repositories.characters.getCharacterById(reaction.employeeId)
    )
  );

  return {
    ...post,
    reactions: post.reactions.map((reaction, index) => {
      const employee = employees[index];
      if (!employee) {
        throw new Error(
          `${reaction.employeeId} Character Canonical을 찾지 못했습니다.`
        );
      }
      return { ...reaction, employee };
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
