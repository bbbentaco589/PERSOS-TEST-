import { anonymousTopics } from "@/data/anonymous-intranet";
import { employees, publicDebates } from "@/data";
import { buildEmployeeReactionFeedItem } from "@/lib/employee-reaction-presentation";
import { listPublishedLiveDemoContents } from "@/lib/live-demo";
import { formatPersonaDisplayName } from "@/lib/persona-display";
import {
  buildPopularEmployeeProfiles,
  buildPublicFeedItems,
  type PopularEmployeeProfile,
} from "@/lib/public-feed-presentation";
import { listPublicDiscussions } from "@/lib/public-discussions";
import { listEmployeeReactionPostViewsByBoard } from "@/lib/repositories";

export type RecentDiscussionItem = {
  id: string;
  category: "debate" | "public" | "anonymous";
  boardLabel: string;
  title: string;
  href: string;
  image: string;
  publishedAt: string;
  author: {
    name: string;
    profileImage: string;
  };
};

export type IntranetLobbyPresentation = {
  recentItems: RecentDiscussionItem[];
  popularEmployees: PopularEmployeeProfile[];
};

export async function getIntranetLobbyPresentation(): Promise<IntranetLobbyPresentation> {
  const [
    discussions,
    liveDemoContents,
    publicReactionPosts,
    debateReactionPosts,
    anonymousReactionPosts,
  ] = await Promise.all([
    listPublicDiscussions(),
    listPublishedLiveDemoContents("feed"),
    listEmployeeReactionPostViewsByBoard("public-feed"),
    listEmployeeReactionPostViewsByBoard("debate"),
    listEmployeeReactionPostViewsByBoard("anonymous"),
  ]);
  const employeeById = new Map(
    employees.map((employee) => [employee.id, employee])
  );
  const toPersonaAuthor = (employee: (typeof employees)[number]) => ({
    name: formatPersonaDisplayName(employee),
    profileImage: employee.profileImage,
  });
  const publicFeedItems = [
    ...publicReactionPosts.map(buildEmployeeReactionFeedItem),
    ...buildPublicFeedItems(discussions, liveDemoContents),
  ].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  const recentPublic: RecentDiscussionItem[] = publicFeedItems
    .slice(0, 2)
    .map((item) => ({
      id: `public-${item.id}`,
      category: "public",
      boardLabel: "전사원 공개 피드",
      title: item.title,
      href: item.href,
      image: "/assets/discussion/activity-v1/public-feed.webp",
      publishedAt: item.publishedAt,
      author: toPersonaAuthor(item.author),
    }));
  const recentDebates: RecentDiscussionItem[] = [
    ...debateReactionPosts.map((post) => {
      const author =
        post.reactions.find((reaction) => reaction.employeeId === "tect")
          ?.employee ?? post.reactions[0]?.employee;
      return {
        id: `debate-reaction-${post.id}`,
        category: "debate" as const,
        boardLabel: "전사원 찬반 토론",
        title: post.title,
        href: `/discussion/${post.slug}`,
        image: "/assets/discussion/activity-v1/debate.webp",
        publishedAt: post.publishedAt,
        author: author
          ? toPersonaAuthor(author)
          : {
              name: "PERSOS Founder",
              profileImage: "/brand/persos-icon.png",
            },
      };
    }),
    ...publicDebates.map((debate) => {
      const author = employeeById.get(
        debate.participants[0]?.employeeId ?? ""
      );
      return {
        id: `debate-${debate.id}`,
        category: "debate" as const,
        boardLabel: "전사원 찬반 토론",
        title: debate.title,
        href: `/discussion/${debate.slug}`,
        image: "/assets/discussion/activity-v1/debate.webp",
        publishedAt: debate.proposedAt,
        author: author
          ? toPersonaAuthor(author)
          : {
              name: "PERSOS Founder",
              profileImage: "/brand/persos-icon.png",
            },
      };
    }),
  ]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, 2);
  const recentAnonymous: RecentDiscussionItem[] = [
    ...anonymousReactionPosts.map((post) => ({
      id: `anonymous-reaction-${post.id}`,
      category: "anonymous" as const,
      boardLabel: "전사원 익명 채팅",
      title: post.title,
      href: "/discussion/anonymous",
      image: "/assets/discussion/activity-v1/anonymous.webp",
      publishedAt: post.publishedAt,
      author: {
        name: "익명 관리자",
        profileImage: "/assets/boards/v1/anonymous-chat.png",
      },
    })),
    ...anonymousTopics.map((topic) => ({
      id: `anonymous-${topic.id}`,
      category: "anonymous" as const,
      boardLabel: "전사원 익명 채팅",
      title: topic.title,
      href: "/discussion/anonymous",
      image: "/assets/discussion/activity-v1/anonymous.webp",
      publishedAt: topic.startedAt,
      author: {
        name: "익명 관리자",
        profileImage: "/assets/boards/v1/anonymous-chat.png",
      },
    })),
  ]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, 2);

  return {
    recentItems: [...recentPublic, ...recentDebates, ...recentAnonymous]
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
      .slice(0, 5),
    popularEmployees: buildPopularEmployeeProfiles(publicFeedItems, 5),
  };
}
