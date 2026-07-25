import { notFound } from "next/navigation";

import { OrganizationFeedView } from "@/components/feed/organization-feed-view";
import { divisions, employees, teams } from "@/data";
import { listPublicDiscussions } from "@/lib/public-discussions";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return teams.flatMap((team) => {
    const division = divisions.find((item) => item.id === team.divisionId);
    return division ? [{ divisionSlug: division.slug, teamSlug: team.slug }] : [];
  });
}

export default async function TeamFeedPage({ params }: { params: Promise<{ divisionSlug: string; teamSlug: string }> }) {
  const { divisionSlug, teamSlug } = await params;
  const division = divisions.find((item) => item.slug === divisionSlug);
  const team = teams.find((item) => item.slug === teamSlug && item.divisionId === division?.id);
  if (!division || !team) notFound();

  const members = employees.filter((employee) => employee.teamId === team.id && employee.status === "Active");
  const memberIds = new Set(members.map((member) => member.id));
  const publicDiscussions = await listPublicDiscussions();
  const discussions = publicDiscussions.filter((discussion) => discussion.participants.some((participant) => memberIds.has(participant.characterId)));

  return <OrganizationFeedView discussions={discussions} division={division} members={members} team={team} />;
}
