import { MessageSquareQuote, Sparkles } from "lucide-react"

import { RealtimeSalesCoach } from "@/components/realtime-sales-coach"

export default function AiSalesPage() {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#7c3aed] uppercase">
          <MessageSquareQuote className="size-3.5" aria-hidden="true" />
          AI 销售引擎
        </div>
        <h2 className="apple-display text-5xl font-semibold leading-none text-[#1d1d1f] sm:text-6xl">
          实时销售教练
        </h2>
        <p className="mt-4 flex max-w-3xl items-start gap-2 text-base leading-7 text-[#6e6e73]">
          <Sparkles className="mt-1.5 size-4 shrink-0 text-[#7c3aed]" aria-hidden="true" />
          模拟客户对话并即时拆解异议，让销售在关键沟通节点获得清晰的反驳逻辑和推荐话术。
        </p>
      </section>

      <RealtimeSalesCoach />
    </div>
  )
}
