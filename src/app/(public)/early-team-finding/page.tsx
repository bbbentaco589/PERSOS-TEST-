import { PageContainer } from "@/components/layout/page-container";
import { PageHero } from "@/components/sections/page-hero";
import { Card, CardContent } from "@/components/ui/card";

const needs = [
  "Technical collaborator who can help convert mock workflows into API-backed product flows.",
  "Motion and video creator who can package employee discussions into repeatable YouTube formats.",
  "Editorial operator who understands source quality, human review, and content calendars.",
];

export default function EarlyTeamFindingPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHero
        eyebrow="Early Team Finding"
        title="A small team surface for the validation stage."
        description="The current product is solo-founder friendly, but the studio model is designed so 5-10 future operators can own distinct production systems."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {needs.map((need) => (
          <Card className="bg-white/[0.025]" key={need}>
            <CardContent className="p-5 text-sm leading-6 text-muted-foreground">{need}</CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
