import Link from "next/link"
import { ArrowUpRight, MessageSquareText, ShieldAlert, Star, UsersRound } from "lucide-react"

import { QuickEntry } from "@/components/quick-entry"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { customerStatusLabels } from "@/lib/customer-status"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const [customerCount, gradeACount, highRiskCount, interactionCount, recentCustomers] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { qualityGrade: "A" } }),
    prisma.customer.count({ where: { churnRisk: "高风险" } }),
    prisma.interaction.count(),
    prisma.customer.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
  ])
  const metrics = [
    { label: "客户总数", value: customerCount, icon: UsersRound, style: "bg-[#e8efff] text-[#1d4ed8]" },
    { label: "A 类线索", value: gradeACount, icon: Star, style: "bg-[#f5efff] text-[#753bbd]" },
    { label: "高风险客户", value: highRiskCount, icon: ShieldAlert, style: "bg-[#fff0f0] text-[#b42318]" },
    { label: "沟通记录", value: interactionCount, icon: MessageSquareText, style: "bg-[#edf9f0] text-[#248a3d]" },
  ]

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-[#2563eb]">业务主台</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-5xl">销售仪表盘</h2>
        <p className="mt-3 text-sm text-[#6b7280]">集中查看客户质量、沟通进度与风险变化。</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className={metric.style}>
              <CardHeader className="flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-semibold">{metric.label}</CardTitle>
                <Icon className="size-4" aria-hidden="true" />
              </CardHeader>
              <CardContent><p className="text-3xl font-semibold tabular-nums">{metric.value}</p></CardContent>
            </Card>
          )
        })}
      </section>

      <QuickEntry />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>最近更新客户</CardTitle>
          <Link href="/customers" className="flex items-center gap-1 text-xs font-semibold text-[#2563eb]">查看客户库<ArrowUpRight className="size-3.5" /></Link>
        </CardHeader>
        <CardContent className="divide-y divide-black/[0.055]">
          {recentCustomers.length ? recentCustomers.map((customer) => (
            <Link key={customer.id} href={`/customers/${customer.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#111827] text-xs font-semibold text-white">{customer.name.slice(0, 1)}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{customer.name}</span><span className="block truncate text-xs text-[#9ca3af]">{customer.company}</span></span>
              <span className="text-xs text-[#6b7280]">{customerStatusLabels[customer.status] ?? customer.status}</span>
              <span className="rounded-full bg-[#e8efff] px-2 py-1 text-xs font-semibold text-[#1d4ed8]">{customer.qualityGrade} 类</span>
            </Link>
          )) : <p className="py-8 text-center text-sm text-[#9ca3af]">暂无客户数据</p>}
        </CardContent>
      </Card>
    </div>
  )
}
