import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="Settings"
      description="Future configuration surface for environment variables, model routing, auth, database, and publishing integrations."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["OpenAI API", "Not connected. Prepared for server-only lazy initialization."],
          ["Postgres", "Not connected. Data layer is currently mock-driven."],
          ["Authentication", "Not connected. Admin routes are public during foundation stage."],
          ["Vercel", "Ready for project linking and environment setup later."],
        ].map(([title, description]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
