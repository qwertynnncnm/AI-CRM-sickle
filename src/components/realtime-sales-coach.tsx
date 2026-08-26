"use client"

import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Bot,
  Check,
  Copy,
  CornerDownLeft,
  Lightbulb,
  LoaderCircle,
  MessageCircleMore,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ConversationMessage = {
  id: number
  role: "customer" | "sales"
  content: string
  time: string
}

type CoachResult = {
  rebuttalLogic: string
  recommendedScript: string
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  }).format(date)
}

function minutesAgo(minutes: number) {
  return formatTime(new Date(Date.now() - minutes * 60_000))
}

const initialMessages: ConversationMessage[] = [
  {
    id: 1,
    role: "sales",
    content: "王总，结合刚才沟通的团队协作问题，我可以进一步介绍一下 AI 沟通分析如何帮助销售统一跟进节奏。",
    time: minutesAgo(2),
  },
  {
    id: 2,
    role: "customer",
    content: "方案方向可以，但我们还需要评估投入和现有系统的衔接。",
    time: minutesAgo(1),
  },
]

function currentTime() {
  return formatTime(new Date())
}

async function readResponseError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  return body?.error || "实时辅导生成失败，请稍后重试。"
}

export function RealtimeSalesCoach() {
  const [messages, setMessages] = useState(initialMessages)
  const [objection, setObjection] = useState("")
  const [coachResult, setCoachResult] = useState<CoachResult | null>(null)
  const [latestObjection, setLatestObjection] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [needsConfiguration, setNeedsConfiguration] = useState(false)
  const [copied, setCopied] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = objection.trim()
    if (!content || pending) return

    const nextMessage: ConversationMessage = {
      id: Date.now(),
      role: "customer",
      content,
      time: currentTime(),
    }
    const nextMessages = [...messages, nextMessage]
    const controller = new AbortController()
    abortControllerRef.current?.abort()
    abortControllerRef.current = controller

    setMessages(nextMessages)
    setObjection("")
    setLatestObjection(content)
    setCoachResult(null)
    setError("")
    setNeedsConfiguration(false)
    setCopied(false)
    setPending(true)

    try {
      const response = await fetch("/api/realtime-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
        signal: controller.signal,
      })

      if (response.status === 401) setNeedsConfiguration(true)
      if (!response.ok) throw new Error(await readResponseError(response))

      const result = (await response.json()) as CoachResult
      if (!result.rebuttalLogic?.trim() || !result.recommendedScript?.trim()) {
        throw new Error("大模型返回的辅导内容不完整。")
      }
      setCoachResult(result)
    } catch (requestError) {
      if (controller.signal.aborted) return
      setError(
        requestError instanceof Error
          ? requestError.message
          : "实时辅导生成失败，请稍后重试。"
      )
    } finally {
      if (!controller.signal.aborted) setPending(false)
    }
  }

  async function copyRecommendedScript() {
    if (!coachResult?.recommendedScript) return
    try {
      await navigator.clipboard.writeText(coachResult.recommendedScript)
      setCopied(true)
      toast.success("推荐话术已复制")
      window.setTimeout(() => setCopied(false), 1_500)
    } catch {
      toast.error("复制失败，请手动选择话术复制。")
    }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(32rem,1.22fr)_minmax(23rem,0.78fr)]">
      <Card className="overflow-hidden [--card-spacing:--spacing(5)]">
        <CardHeader className="border-b border-black/[0.055] bg-white pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex size-11 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                <UserRound className="size-5" aria-hidden="true" />
                <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-[#22c55e]" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-lg">模拟客户沟通</CardTitle>
                <p className="mt-0.5 text-xs text-[#86868b]">客户在线 · 输入异议后按回车</p>
              </div>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-[#ecfdf3] px-3 py-1.5 text-xs font-semibold text-[#15803d] sm:flex">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              AI 教练待命
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-[34rem] overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(219,234,254,0.7),transparent_34%),#f3f6f9] px-4 py-6 sm:px-6 [scrollbar-width:thin]">
            <div className="mx-auto mb-5 w-fit rounded-full bg-white/75 px-3 py-1 text-[0.68rem] text-[#86868b] shadow-sm">
              今天 10:26
            </div>
            <div className="space-y-5">
              {messages.map((message) => {
                const isSales = message.role === "sales"
                return (
                  <div key={message.id} className={cn("flex items-end gap-2.5", isSales ? "justify-end" : "justify-start")}>
                    {!isSales && (
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#64748b] shadow-sm">
                        <UserRound className="size-4" aria-hidden="true" />
                      </span>
                    )}
                    <div className={cn("max-w-[78%]", isSales && "text-right")}>
                      <p className="mb-1 px-1 text-[0.68rem] text-[#86868b]">
                        {isSales ? "销售顾问" : "客户"} · {message.time}
                      </p>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left text-sm leading-6 shadow-[0_5px_18px_rgba(15,23,42,0.07)]",
                          isSales
                            ? "rounded-br-md bg-[#2563eb] text-white"
                            : "rounded-bl-md bg-white text-[#334155]"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                    {isSales && (
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-sm">
                        <MessageCircleMore className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div ref={conversationEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-black/[0.055] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <label htmlFor="customer-objection" className="sr-only">输入客户异议</label>
              <Input
                id="customer-objection"
                value={objection}
                onChange={(event) => setObjection(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                placeholder="输入客户异议，例如：价格还是太高了……"
                maxLength={2_000}
                disabled={pending}
                autoComplete="off"
                className="h-11 flex-1"
              />
              <Button type="submit" size="icon-lg" disabled={pending || !objection.trim()} aria-label={pending ? "正在获取实时辅导" : "发送客户异议"}>
                {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
              </Button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#86868b]">
              <CornerDownLeft className="size-3.5" aria-hidden="true" />
              按 Enter 发送，AI 将结合完整对话给出实时锦囊
            </p>
          </form>
        </CardContent>
      </Card>

      <aside className="xl:sticky xl:top-6" aria-label="AI 实时锦囊">
        <Card className="min-h-[42rem] bg-[radial-gradient(circle_at_90%_0%,rgba(139,92,246,0.18),transparent_32%),linear-gradient(145deg,#ffffff_0%,#f7f5ff_100%)]">
          <CardHeader className="border-b border-black/[0.055] pb-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-[0_6px_18px_rgba(124,58,237,0.24)]">
                <Bot className="size-[1.1rem]" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-2xl">AI 实时锦囊</CardTitle>
                <p className="mt-1.5 text-sm leading-6 text-[#6e6e73]">聚焦最新异议，提供拆解思路与可直接使用的话术。</p>
              </div>
            </div>
          </CardHeader>

          <CardContent aria-live="polite">
            {needsConfiguration ? (
              <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#ff9f0a]/20 bg-[#fff8e8] px-4 py-3 text-[#633c00]">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#c93400]" aria-hidden="true" />
                <div>
                  <p className="font-medium">未检测到大模型 API 配置。</p>
                  <Link href="/settings" className="mt-1.5 inline-flex text-sm font-semibold text-[#0066cc] hover:text-[#0071e3]">前往系统与大模型设置</Link>
                </div>
              </div>
            ) : pending ? (
              <div className="flex min-h-[31rem] flex-col items-center justify-center text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-[#ede9fe] text-[#7c3aed]">
                  <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
                </span>
                <p className="mt-4 font-semibold text-[#334155]">金牌教练正在拆解异议</p>
                <p className="mt-1 max-w-xs text-sm leading-6 text-[#86868b]">正在结合完整对话判断客户的真实顾虑与推进路径。</p>
              </div>
            ) : error ? (
              <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#b42318]">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : coachResult ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="rounded-2xl border border-[#f59e0b]/20 bg-[#fffbeb] p-4 shadow-[0_8px_24px_rgba(245,158,11,0.08)]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#92400e]">
                    <Lightbulb className="size-4" aria-hidden="true" />
                    反驳逻辑
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#78350f]">{coachResult.rebuttalLogic}</p>
                </div>

                <div className="rounded-2xl border border-[#2563eb]/18 bg-[#eff6ff] p-4 shadow-[0_8px_24px_rgba(37,99,235,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#1d4ed8]">
                      <Sparkles className="size-4" aria-hidden="true" />
                      推荐话术
                    </p>
                    <Button type="button" variant="ghost" size="sm" onClick={copyRecommendedScript} className="text-[#1d4ed8] hover:bg-white/70 hover:text-[#1d4ed8]">
                      {copied ? <><Check aria-hidden="true" />已复制</> : <><Copy aria-hidden="true" />复制话术</>}
                    </Button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-8 text-[#1e3a8a]">“{coachResult.recommendedScript}”</p>
                </div>

                <div className="rounded-xl bg-white/75 px-3 py-2 text-xs leading-5 text-[#64748b]">
                  <span className="font-semibold text-[#475569]">本次异议：</span>{latestObjection}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[31rem] flex-col items-center justify-center text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-[#ede9fe] text-[#7c3aed]">
                  <Sparkles className="size-6" aria-hidden="true" />
                </span>
                <p className="mt-4 font-semibold text-[#334155]">等待客户异议</p>
                <p className="mt-1 max-w-xs text-sm leading-6 text-[#86868b]">在左侧输入客户的真实顾虑并发送，锦囊会自动高亮展示。</p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
