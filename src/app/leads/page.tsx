import Link from "next/link"
import { ArrowUpRight, Building2, ShieldAlert, Star, UsersRound } from "lucide-react"

import { NewCustomerDialog } from "@/components/new-customer-dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { parseTraceablePoints } from "@/lib/analysis"
import { customerStatusLabels } from "@/lib/customer-status"
import { prisma } from "@/lib/prisma"

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Hong_Kong",
})

function gradeStyle(grade: string) {
  if (grade === "A") return "bg-[#eaf4ff] text-[#0066cc]"
  if (grade === "B") return "bg-[#f5efff] text-[#753bbd]"
  if (grade === "C") return "bg-[#fff8e8] text-[#9a5b00]"
  return "bg-[#f0f0f2] text-[#6e6e73]"
}

export default async function LeadsPage() {
  const customers = await prisma.customer.findMany({
    orderBy: [{ qualityGrade: "asc" }, { updatedAt: "desc" }],
    include: {
      interactions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { aiAnalysisResult: true },
      },
    },
  })

  const leads = customers.map((customer) => {
    const interaction = customer.interactions[0] ?? null
    const analysis = interaction?.aiAnalysisResult ?? null
    return {
      ...customer,
      summary: analysis?.summary ?? "暂无 AI 沟通摘要",
      roadblocks: analysis ? parseTraceablePoints(analysis.roadblocks) : [],
      lastContactAt: interaction?.createdAt ?? null,
    }
  })
  const stats = [
    ["客户池总数", leads.length, UsersRound, "bg-[#1d1d1f] text-white"],
    ["A 类客户", leads.filter((item) => item.qualityGrade === "A").length, Star, "bg-[#eaf4ff] text-[#0066cc]"],
    ["B 类客户", leads.filter((item) => item.qualityGrade === "B").length, Star, "bg-[#f5efff] text-[#753bbd]"],
    ["C 类客户", leads.filter((item) => item.qualityGrade === "C").length, Star, "bg-[#fff8e8] text-[#9a5b00]"],
    ["高风险", leads.filter((item) => item.churnRisk === "高风险").length, ShieldAlert, "bg-[#fff0f0] text-[#b42318]"],
    ["已成交", leads.filter((item) => item.status === "Closed").length, Building2, "bg-[#edf9f0] text-[#248a3d]"],
  ] as const

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="apple-display text-5xl font-semibold text-[#1d1d1f] sm:text-6xl">线索池</h2>
          <p className="mt-3 text-[#6e6e73]">标准化客户画像、AI 等级与成交风险总览。</p>
        </div>
        <NewCustomerDialog />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map(([label, value, Icon, style]) => (
          <Card key={label} className={style}>
            <CardHeader className="flex-row items-center justify-between pb-1">
              <span className="text-xs font-medium">{label}</span>
              <Icon className="size-4" aria-hidden="true" />
            </CardHeader>
            <CardContent><p className="text-3xl font-semibold tabular-nums">{value}</p></CardContent>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table className="min-w-[1120px]">
            <TableHeader>
              <TableRow className="bg-[#f5f5f7]">
                <TableHead className="pl-5">姓名 / 电话</TableHead>
                <TableHead>公司</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>线索等级</TableHead>
                <TableHead>流失风险</TableHead>
                <TableHead className="w-80">AI 沟通摘要</TableHead>
                <TableHead className="w-64">成交卡点</TableHead>
                <TableHead>最后沟通</TableHead>
                <TableHead><span className="sr-only">操作</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length ? leads.map((lead) => (
                <TableRow key={lead.id} className="align-top">
                  <TableCell className="pl-5">
                    <Link href={`/customers/${lead.id}`} className="font-semibold hover:text-[#0066cc]">{lead.name}</Link>
                    <p className="mt-1 text-xs text-[#86868b]">{lead.phone}</p>
                  </TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{customerStatusLabels[lead.status] ?? lead.status}</TableCell>
                  <TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${gradeStyle(lead.qualityGrade)}`}>{lead.qualityGrade} 类</span></TableCell>
                  <TableCell>{lead.churnRisk}</TableCell>
                  <TableCell className="whitespace-normal text-xs leading-5">{lead.summary}</TableCell>
                  <TableCell className="whitespace-normal text-xs leading-5">{lead.roadblocks.map((item) => item.point).join("；") || "暂无"}</TableCell>
                  <TableCell className="text-xs">{lead.lastContactAt ? formatter.format(lead.lastContactAt) : "尚未沟通"}</TableCell>
                  <TableCell><Link href={`/customers/${lead.id}`} aria-label={`查看${lead.name}`}><ArrowUpRight className="size-4" /></Link></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={9} className="h-64 text-center text-[#86868b]">线索池暂无客户</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
