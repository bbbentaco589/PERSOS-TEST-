import { AdminList } from "@/components/admin/admin-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { sources } from "@/data";

export default function AdminSourcesPage() {
  return (
    <AdminShell
      title="Source Registry"
      description="Track source priority, trust levels, and allowed usage before future ingestion is connected."
    >
      <AdminList
        title="Sources"
        rows={sources.map((source) => ({
          primary: source.name,
          secondary: `${source.type} / ${source.usage}`,
          status: source.trustLevel,
        }))}
      />
    </AdminShell>
  );
}
