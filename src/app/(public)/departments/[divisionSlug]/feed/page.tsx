import { notFound } from "next/navigation";

import { OrganizationFeedView } from "@/components/feed/organization-feed-view";
import { divisions, employees } from "@/data";
import { listPublicDiscussions } from "@/lib/public-discussions";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return divisions.map((division) => ({ divisionSlug: division.slug }));
}

export default async function DivisionFeedPage({ params }: { params: Promise<{ divisionSlug: string }> }) {
  const { divisionSlug } = await params;
  const division = divisions.find((item) => item.slug === divisionSlug);
  if (!division) notFound();

  const members = employees.filter((employee) => employee.divisionId === division.id && employee.status === "Active");
  const memberIds = new Set(members.map((member) => member.id));
  const publicDiscussions = await listPublicDiscussions();
  const discussions = publicDiscussions.filter((discussion) => discussion.participants.some((participant) => memberIds.has(participant.characterId)));

  return <OrganizationFeedView discussions={discussions} division={division} members={members} />;
}
