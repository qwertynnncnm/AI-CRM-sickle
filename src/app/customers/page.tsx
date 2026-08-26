import Link from "next/link"
import { ArrowUpRight, Contact } from "lucide-react"

import { NewCustomerDialog } from "@/components/new-customer-dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { customerStatusLabels } from "@/lib/customer-status"
import { prisma } from "@/lib/prisma"

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Hong_Kong",
})

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { updatedAt: "desc" } })

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2563eb]">业务主台</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-5xl">客户库</h2>
          <p className="mt-3 text-sm text-[#6b7280]">管理所有已建档客户及其标准化业务属性。</p>
        </div>
        <NewCustomerDialog />
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8fafc]">
                <TableHead className="pl-5">客户</TableHead>
                <TableHead>公司</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>线索等级</TableHead>
                <TableHead>流失风险</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead><span className="sr-only">操作</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length ? customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-[#e8efff] text-xs font-semibold text-[#1d4ed8]">{customer.name.slice(0, 1)}</span>
                      <div><Link href={`/customers/${customer.id}`} className="font-semibold hover:text-[#2563eb]">{customer.name}</Link><p className="mt-0.5 text-xs text-[#9ca3af]">{customer.phone}</p></div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.company}</TableCell>
                  <TableCell>{customerStatusLabels[customer.status] ?? customer.status}</TableCell>
                  <TableCell><span className="rounded-full bg-[#e8efff] px-2 py-1 text-xs font-semibold text-[#1d4ed8]">{customer.qualityGrade} 类</span></TableCell>
                  <TableCell>{customer.churnRisk}</TableCell>
                  <TableCell className="text-xs text-[#6b7280]">{formatter.format(customer.updatedAt)}</TableCell>
                  <TableCell><Link href={`/customers/${customer.id}`} aria-label={`查看${customer.name}`}><ArrowUpRight className="size-4" /></Link></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={7} className="h-64 text-center"><Contact className="mx-auto mb-3 size-8 text-[#cbd5e1]" /><p className="text-sm text-[#9ca3af]">客户库暂无数据</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
