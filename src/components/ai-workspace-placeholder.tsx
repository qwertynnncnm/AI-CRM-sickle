import type { LucideIcon } from "lucide-react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type AiWorkspacePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  capabilities: string[]
}

export function AiWorkspacePlaceholder({ eyebrow, title, description, icon: Icon, capabilities }: AiWorkspacePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] bg-[#111827] px-6 py-8 text-white shadow-[0_18px_50px_rgba(17,24,39,0.16)] sm:px-8">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#2563eb] text-white"><Icon className="size-5" aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-[#93c5fd] uppercase">{eyebrow}</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d1d5db]">{description}</p>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        {capabilities.map((capability, index) => (
          <Card key={capability}>
            <CardHeader>
              <span className="text-xs font-semibold text-[#2563eb]">0{index + 1}</span>
              <CardTitle className="text-base">{capability}</CardTitle>
              <CardDescription>能力模块已纳入工作区路由，可继续接入业务流程与模型调用。</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-xs text-[#6b7280]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-[#16a34a]" />架构已就绪</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
