import { employeeReactionPosts } from "@/data/employee-reaction-posts";
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

export async function listEmployeeReactionPosts() {
  return employeeReactionPosts.map(clonePost);
}

export async function getEmployeeReactionPostByBoard(
  board: Exclude<EmployeeReactionBoard, "investor-demo">
) {
  const post = employeeReactionPosts.find((candidate) => candidate.board === board);
  return post ? clonePost(post) : undefined;
}

export async function getEmployeeReactionPostBySlug(
  slug: string
) {
  const post = employeeReactionPosts.find((candidate) => candidate.slug === slug);
  return post ? clonePost(post) : undefined;
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
