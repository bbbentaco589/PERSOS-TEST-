import { AdminList } from "@/components/admin/admin-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { topics } from "@/data";

export default function AdminTopicsPage() {
  return (
    <AdminShell
      title="Topic Management"
      description="Queue, prioritize, and prepare topics before they enter the Discussion Engine."
    >
      <AdminList
        title="Topics"
        rows={topics.map((topic) => ({
          primary: topic.title,
          secondary: `${topic.sourceHint} / Priority: ${topic.priority}`,
          status: topic.status,
        }))}
      />
    </AdminShell>
  );
}
