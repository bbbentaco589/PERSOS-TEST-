import { AdminList } from "@/components/admin/admin-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { knowledgeEntries } from "@/data";

export default function AdminKnowledgeBasePage() {
  return (
    <AdminShell
      title="Knowledge Base"
      description="Review source-backed knowledge records that will later power retrieval and character context."
    >
      <AdminList
        title="Knowledge Entries"
        rows={knowledgeEntries.map((entry) => ({
          primary: entry.title,
          secondary: `${entry.category} / ${entry.summary}`,
          status: entry.confidence,
        }))}
      />
    </AdminShell>
  );
}
