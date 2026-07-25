import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Pagination() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <Button variant="ghost" size="sm">
        <ChevronLeft className="size-4" />
        Previous
      </Button>
      <span className="text-xs text-muted-foreground">Page 1 of 1</span>
      <Button variant="ghost" size="sm">
        Next
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
