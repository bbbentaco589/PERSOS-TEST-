import { DivisionIcon } from "@/components/brand/division-icon";
import { Tag } from "@/components/shared/tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Department } from "@/types";

export function DepartmentCard({ department }: { department: Department }) {
  const divisionIdByDepartment = {
    research: "division-intelligence",
    legal: "division-governance",
    creative: "division-studio",
    business: "division-strategy",
    media: "division-editorial",
  } as const;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <DivisionIcon divisionId={divisionIdByDepartment[department.id]} />
          <CardTitle>{department.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{department.mandate}</p>
        <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">주요 역할</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {department.roles.map((role) => (
            <Tag key={role}>{role}</Tag>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
