"use client"

import Link from "next/link"
import { useActionState } from "react"
import {
  AlertTriangle,
  Bot,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react"

import {
  generateTeamReport,
  type TeamReportState,
} from "@/app/ai-insights/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const initialState: TeamReportState = { success: false, message: "" }

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Hong_Kong",
})

export function TeamReportGenerator() {
  const [state, formAction, pending] = useActionState(
    generateTeamReport,
    initialState
  )

  return (
    <Card className="relative overflow-hidden bg-[radial-gradient(circle_at_88%_0%,rgba(37,99,235,0.19),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f4f7ff_100%)]">
      <CardHeader className="border-b border-black/[0.055] pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_6px_18px_rgba(37,99,235,0.24)]">
              <Bot className="size-[1.1rem]" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-2xl">AI 团队战报</CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl leading-6">
                基于当前客户结构、AI 分析覆盖和最近六个月新增趋势，生成管理视角总结。
              </CardDescription>
            </div>
          </div>
          <form action={formAction}>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  正在生成战报
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" />
                  生成团队战报
                </>
              )}
            </Button>
          </form>
        </div>
      </CardHeader>

      <CardContent aria-live="polite">
        {state.needsConfiguration ? (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#ff9f0a]/20 bg-[#fff8e8] px-4 py-3 text-[#633c00]">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#c93400]" aria-hidden="true" />
            <div>
              <p className="font-medium">{state.message}</p>
              <Link href="/settings" className="mt-1.5 inline-flex text-sm font-semibold text-[#0066cc] hover:text-[#0071e3]">
                前往系统与大模型设置
              </Link>
            </div>
          </div>
        ) : state.report ? (
          <article className="rounded-2xl border border-black/[0.055] bg-white/80 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.055] pb-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
                <FileText className="size-4 text-[#2563eb]" aria-hidden="true" />
                最新管理战报
              </p>
              {state.generatedAt && (
                <time className="text-xs text-[#86868b]" dateTime={state.generatedAt}>
                  {timeFormatter.format(new Date(state.generatedAt))} 生成
                </time>
              )}
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#424245]">
              {state.report}
            </p>
          </article>
        ) : state.message ? (
          <p role="alert" className="rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm text-[#b42318]">
            {state.message}
          </p>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/55 text-center">
            <FileText className="size-6 text-[#94a3b8]" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-[#6e6e73]">尚未生成本期团队战报</p>
            <p className="mt-1 text-xs text-[#86868b]">点击按钮后，大模型将读取最新聚合数据进行总结。</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
