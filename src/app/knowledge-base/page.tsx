import Link from "next/link"
import { BookOpen, Database, Quote, Search, X } from "lucide-react"

import {
  KnowledgeEntryActions,
  NewKnowledgeDialog,
} from "@/components/knowledge-base-dialogs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Hong_Kong",
})

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q
  const query = rawQuery?.trim().slice(0, 100) ?? ""
  const where = query
    ? {
        OR: [
          { question: { contains: query } },
          { answer: { contains: query } },
        ],
      }
    : undefined

  const [entries, totalCount, citationAggregate] = await Promise.all([
    prisma.knowledgeBase.findMany({
      where,
      orderBy: [{ citationCount: "desc" }, { createdAt: "desc" }],
    }),
    prisma.knowledgeBase.count(),
    prisma.knowledgeBase.aggregate({ _sum: { citationCount: true } }),
  ])

  const totalCitations = citationAggregate._sum.citationCount ?? 0

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#753bbd] uppercase">
            <BookOpen className="size-3.5" aria-hidden="true" />
            RAG 标准话术中心
          </div>
          <h2 className="apple-display text-5xl font-semibold leading-none text-[#1d1d1f] sm:text-6xl">
            知识库
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6e6e73]">
            沉淀高质量问答与销售话术，在沟通分析和销售助理回答前自动检索增强。
          </p>
        </div>
        <NewKnowledgeDialog />
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="知识库数据概览">
        <Card className="bg-[#1d1d1f] text-white ring-0">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-xs text-[#a1a1a6]">知识条目总数</p>
              <p className="apple-display mt-1 text-4xl font-semibold tabular-nums">{totalCount}</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-[#64d2ff]">
              <Database className="size-5" aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
        <Card className="bg-[#f5efff] text-[#6633a3] ring-[#753bbd]/10">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-xs text-current/65">累计 AI 引用</p>
              <p className="apple-display mt-1 text-4xl font-semibold tabular-nums">{totalCitations}</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-[#753bbd] text-white">
              <Quote className="size-5" aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent>
          <form action="/knowledge-base" method="get" className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">搜索知识库</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#86868b]" aria-hidden="true" />
              <Input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="搜索客户问题或标准话术……"
                maxLength={100}
                className="pl-10"
              />
            </label>
            <Button type="submit">
              <Search aria-hidden="true" />
              搜索
            </Button>
            {query && (
              <Button variant="outline" render={<Link href="/knowledge-base" />}>
                <X aria-hidden="true" />
                清除
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.055] px-5 py-4">
          <div>
            <h3 className="font-semibold text-[#1d1d1f]">
              {query ? `“${query}”的搜索结果` : "全部标准话术"}
            </h3>
            <p className="mt-0.5 text-xs text-[#86868b]">当前显示 {entries.length} 条</p>
          </div>
        </div>
        <CardContent className="p-0">
          <Table className="min-w-[980px] table-fixed">
            <TableHeader>
              <TableRow className="bg-[#f5f5f7]/80 hover:bg-[#f5f5f7]/80">
                <TableHead className="w-72 pl-5">客户常见问题</TableHead>
                <TableHead className="w-[30rem]">标准话术</TableHead>
                <TableHead className="w-28 text-center">引用次数</TableHead>
                <TableHead className="w-32">创建日期</TableHead>
                <TableHead className="w-24 pr-4 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow key={entry.id} className="align-top">
                    <TableCell className="py-4 pl-5 align-top whitespace-normal">
                      <div className="flex gap-2.5">
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eaf4ff] text-xs font-semibold text-[#0066cc]">
                          Q
                        </span>
                        <p className="line-clamp-4 font-medium leading-6 text-[#1d1d1f]">
                          {entry.question}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top whitespace-normal">
                      <div className="flex gap-2.5">
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#edf9f0] text-xs font-semibold text-[#248a3d]">
                          A
                        </span>
                        <p className="line-clamp-5 text-sm leading-6 text-[#424245]">
                          {entry.answer}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center align-top">
                      <span className="inline-flex min-w-10 justify-center rounded-full bg-[#f5efff] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#753bbd] ring-1 ring-[#753bbd]/10">
                        {entry.citationCount}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-top text-xs text-[#86868b]">
                      {dateFormatter.format(entry.createdAt)}
                    </TableCell>
                    <TableCell className="py-3 pr-4 align-top">
                      <KnowledgeEntryActions
                        entry={{
                          id: entry.id,
                          question: entry.question,
                          answer: entry.answer,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="h-64 whitespace-normal">
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="flex size-12 items-center justify-center rounded-full bg-[#f5efff] text-[#753bbd]">
                        <BookOpen className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 font-semibold text-[#1d1d1f]">
                        {query ? "没有匹配的知识条目" : "知识库还是空的"}
                      </h3>
                      <p className="mt-1 max-w-sm text-sm leading-6 text-[#6e6e73]">
                        {query
                          ? "换一个关键词搜索，或新增一条对应的标准话术。"
                          : "新增第一条标准话术后，AI 即可在相关沟通中自动检索。"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
