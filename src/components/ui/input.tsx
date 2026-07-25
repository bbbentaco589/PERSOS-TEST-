import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-cyan-300/50 focus:ring-3 focus:ring-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
