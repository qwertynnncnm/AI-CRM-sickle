import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-2xl border border-black/10 bg-white/80 px-3.5 py-3 text-base leading-6 shadow-[inset_0_1px_1px_rgba(0,0,0,0.025)] transition-all outline-none placeholder:text-[#86868b] focus-visible:border-[#0071e3]/55 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#0071e3]/12 disabled:cursor-not-allowed disabled:bg-black/[0.035] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
