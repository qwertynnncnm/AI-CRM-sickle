import { Megaphone, Sparkles } from "lucide-react"

import { MarketingCopyStudio } from "@/components/marketing-copy-studio"

export default function AiMarketingPage() {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#2563eb] uppercase">
          <Megaphone className="size-3.5" aria-hidden="true" />
          AI 营销与获客
        </div>
        <h2 className="apple-display text-5xl font-semibold leading-none text-[#1d1d1f] sm:text-6xl">
          全渠道文案生成
        </h2>
        <p className="mt-4 flex max-w-3xl items-start gap-2 text-base leading-7 text-[#6e6e73]">
          <Sparkles className="mt-1.5 size-4 shrink-0 text-[#2563eb]" aria-hidden="true" />
          输入一份产品资料，同时生成邮件、企业微信和短信三种场景文案，并在生成过程中实时查看结果。
        </p>
      </section>

      <MarketingCopyStudio />
    </div>
  )
}
