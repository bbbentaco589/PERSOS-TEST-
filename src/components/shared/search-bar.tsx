import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SearchBar({ placeholder = "페르소스에서 검색" }: { placeholder?: string }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input aria-label={placeholder} className="pl-9" placeholder={placeholder} />
    </label>
  );
}
