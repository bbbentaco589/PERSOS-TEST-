import { Sparkles } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-white/10 py-10 text-center">
        <Sparkles className="size-6 text-cyan-200" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
  );
}
