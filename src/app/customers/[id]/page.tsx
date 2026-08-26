import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building2, Phone, ShieldAlert, Star } from "lucide-react"

import {
  ImmersiveAnalysisView,
  type AnalysisSession,
} from "@/components/immersive-analysis-view"
import { Button } from "@/components/ui/button"
import { parseTraceablePoints, parseTranscript } from "@/lib/analysis"
import { customerStatusLabels } from "@/lib/customer-status"
import { prisma } from "@/lib/prisma"

function parseCustomerId(value: string) {
  if (!/^\d+$/.test(value)) notFound()
  const customerId = Number(value)
  if (!Number.isSafeInteger(customerId) || customerId <= 0) notFound()
  return customerId
}

export default async function CustomerDetailPage({
  params,
}: PageProps<"/customers/[id]">) {
  const { id } = await params
  const customerId = parseCustomerId(id)
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      interactions: {
        orderBy: { createdAt: "desc" },
        include: { aiAnalysisResult: true },
      },
    },
  })
  if (!customer) notFound()

  const sessions: AnalysisSession[] = customer.interactions.map((interaction) => ({
    id: interaction.id,
    createdAt: interaction.createdAt.toISOString(),
    rawContent: interaction.rawContent,
    transcript: parseTranscript(interaction.transcript),
    analysis: interaction.aiAnalysisResult
      ? {
          summary: interaction.aiAnalysisResult.summary,
          negotiationStrategy: parseTraceablePoints(
            interaction.aiAnalysisResult.negotiationStrategy
          ),
          roadblocks: parseTraceablePoints(interaction.aiAnalysisResult.roadblocks),
        }
      : null,
  }))

  return (
    <div className="space-y-5">
      <Button variant="ghost" render={<Link href="/customers" />}>
        <ArrowLeft aria-hidden="true" /> 返回客户库
      </Button>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
            <span className="flex items-center gap-1.5"><Building2 className="size-3.5" />{customer.company}</span>
            <span className="text-[#cbd5e1]">/</span>
            <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{customer.phone}</span>
            <span className="text-[#cbd5e1]">/</span>
            <span>{customerStatusLabels[customer.status] ?? customer.status}</span>
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#0f172a] sm:text-4xl">
            {customer.name} · 沟通分析
          </h2>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 rounded-xl bg-[#eff6ff] px-3 py-2 text-xs font-semibold text-[#1d4ed8]">
            <Star className="size-3.5" /> {customer.qualityGrade} 类线索
          </span>
          <span className="flex items-center gap-1.5 rounded-xl bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#c2410c]">
            <ShieldAlert className="size-3.5" /> {customer.churnRisk}
          </span>
        </div>
      </section>

      <ImmersiveAnalysisView sessions={sessions} />
    </div>
  )
}
