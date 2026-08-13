import { permanentRedirect } from "next/navigation";

export default function KnowledgePage() {
  permanentRedirect("/admin/knowledge-base");
}
