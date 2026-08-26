import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-black/10 bg-white/80 px-3.5 py-2 text-base shadow-[inset_0_1px_1px_rgba(0,0,0,0.025)] transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#86868b] focus-visible:border-[#0071e3]/55 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#0071e3]/12 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/[0.035] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
