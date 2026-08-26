import {
  BarChart3,
  BrainCircuit,
  ScanSearch,
  Sparkles,
  Star,
  Users,
} from "lucide-react"

import { AiInsightsCharts } from "@/components/ai-insights-charts"
import { TeamReportGenerator } from "@/components/team-report-generator"
import { Card, CardContent } from "@/components/ui/card"
import { getAiInsightsData } from "@/lib/ai-insights"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AiInsightsPage() {
  const insights = await getAiInsightsData()
  const aGradeRate =
    insights.totalCustomers > 0
      ? Math.round((insights.aGradeCustomers / insights.totalCustomers) * 1_000) / 10
      : 0

  const coreMetrics = [
    {
      label: "客户总量",
      value: insights.totalCustomers.toLocaleString("zh-CN"),
      note: "当前客户池规模",
      icon: Users,
      tone: "blue",
    },
    {
      label: "A 类客户",
      value: insights.aGradeCustomers.toLocaleString("zh-CN"),
      note: `占全部客户 ${aGradeRate}%`,
      icon: Star,
      tone: "amber",
    },
    {
      label: "AI 分析次数",
      value: insights.analysisCount.toLocaleString("zh-CN"),
      note: "已沉淀沟通分析结果",
      icon: BrainCircuit,
      tone: "purple",
    },
    {
      label: "AI 覆盖率",
      value: `${insights.aiCoverageRate}%`,
      note: `${insights.analyzedCustomerCount} 位客户已有 AI 分析`,
      icon: ScanSearch,
      tone: "green",
    },
  ]

  const toneClasses = {
    blue: "bg-[#eff6ff] text-[#2563eb]",
    amber: "bg-[#fff7ed] text-[#d97706]",
    purple: "bg-[#f5f3ff] text-[#7c3aed]",
    green: "bg-[#ecfdf3] text-[#15803d]",
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#2563eb] uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          AI 洞察中心
        </div>
        <h2 className="apple-display text-5xl font-semibold leading-none text-[#1d1d1f] sm:text-6xl">
          团队效能与战报
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#6e6e73]">
          汇总客户结构、线索质量与 AI 沟通分析覆盖，为销售管理决策提供统一数据视图。
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="核心经营指标">
        {coreMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center gap-4 py-5">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                    toneClasses[metric.tone as keyof typeof toneClasses]
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#6e6e73]">{metric.label}</p>
                  <p className="apple-display mt-1 text-3xl font-semibold tabular-nums text-[#1d1d1f]">
                    {metric.value}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#86868b]">{metric.note}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <AiInsightsCharts
        qualityDistribution={insights.qualityDistribution}
        customerTrend={insights.customerTrend}
      />

      <TeamReportGenerator />

      <p className="flex items-center justify-center gap-1.5 text-xs text-[#86868b]">
        <BarChart3 className="size-3.5" aria-hidden="true" />
        数据直接聚合自本地 SQLite，刷新页面即可获取最新统计。
      </p>
    </div>
  )
}
