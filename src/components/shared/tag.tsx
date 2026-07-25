import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function Tag({ children }: { children: ReactNode }) {
  return <Badge variant="outline">{children}</Badge>;
}
