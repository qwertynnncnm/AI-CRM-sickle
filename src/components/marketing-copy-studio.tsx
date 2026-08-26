"use client"

import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Check,
  Copy,
  LoaderCircle,
  Mail,
  MessageCircleMore,
  MessageSquareText,
  Sparkles,
  WandSparkles,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Channel = "email" | "wecom" | "sms"
type ChannelOutput = {
  text: string
  pending: boolean
  error: string
}
type Outputs = Record<Channel, ChannelOutput>

const channels = [
  { value: "email" as const, label: "邮件营销", icon: Mail },
  { value: "wecom" as const, label: "企微文案", icon: MessageCircleMore },
  { value: "sms" as const, label: "短信模板", icon: MessageSquareText },
]

function createEmptyOutputs(pending = false): Outputs {
  return {
    email: { text: "", pending, error: "" },
    wecom: { text: "", pending, error: "" },
    sms: { text: "", pending, error: "" },
  }
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  return body?.error || "营销文案生成失败，请稍后重试。"
}

export function MarketingCopyStudio() {
  const [productName, setProductName] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [sellingPoints, setSellingPoints] = useState("")
  const [activeTab, setActiveTab] = useState<Channel>("email")
  const [outputs, setOutputs] = useState<Outputs>(() => createEmptyOutputs())
  const [needsConfiguration, setNeedsConfiguration] = useState(false)
  const [copiedChannel, setCopiedChannel] = useState<Channel | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const generating = channels.some((channel) => outputs[channel.value].pending)

  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  async function generateChannel(
    channel: Channel,
    payload: {
      productName: string
      targetAudience: string
      sellingPoints: string
    },
    signal: AbortSignal
  ) {
    try {
      const response = await fetch("/api/generate-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, channel }),
        signal,
      })

      if (response.status === 401) setNeedsConfiguration(true)
      if (!response.ok) throw new Error(await readError(response))
      if (!response.body) throw new Error("服务器没有返回可读取的文本流。")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue
        setOutputs((current) => ({
          ...current,
          [channel]: {
            ...current[channel],
            text: current[channel].text + chunk,
          },
        }))
      }

      const finalChunk = decoder.decode()
      if (finalChunk) {
        setOutputs((current) => ({
          ...current,
          [channel]: {
            ...current[channel],
            text: current[channel].text + finalChunk,
          },
        }))
      }
    } catch (error) {
      if (signal.aborted) return
      setOutputs((current) => ({
        ...current,
        [channel]: {
          ...current[channel],
          error: error instanceof Error ? error.message : "营销文案生成失败。",
        },
      }))
    } finally {
      setOutputs((current) => ({
        ...current,
        [channel]: { ...current[channel], pending: false },
      }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = {
      productName: productName.trim(),
      targetAudience: targetAudience.trim(),
      sellingPoints: sellingPoints.trim(),
    }
    if (!payload.productName || !payload.targetAudience || !payload.sellingPoints) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    setNeedsConfiguration(false)
    setCopiedChannel(null)
    setActiveTab("email")
    setOutputs(createEmptyOutputs(true))

    await Promise.all(
      channels.map((channel) =>
        generateChannel(channel.value, payload, controller.signal)
      )
    )
  }

  async function copyText(channel: Channel) {
    const text = outputs[channel].text.trim()
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopiedChannel(channel)
      toast.success("文案已复制到剪贴板")
      window.setTimeout(() => setCopiedChannel(null), 1_500)
    } catch {
      toast.error("复制失败，请手动选择文案复制。")
    }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(19rem,0.72fr)_minmax(34rem,1.28fr)]">
      <Card className="xl:sticky xl:top-6">
        <CardHeader className="border-b border-black/[0.055] pb-4">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_6px_18px_rgba(37,99,235,0.24)]">
            <WandSparkles className="size-[1.1rem]" aria-hidden="true" />
          </span>
          <CardTitle className="text-2xl">配置营销任务</CardTitle>
          <CardDescription className="mt-1.5 leading-6">
            填写一次产品信息，同时生成适配三个触达渠道的专业文案。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needsConfiguration && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-[#ff9f0a]/20 bg-[#fff8e8] px-4 py-3 text-[#633c00]">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#c93400]" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">未检测到大模型 API 配置。</p>
                <Link href="/settings" className="mt-1.5 inline-flex text-sm font-semibold text-[#0066cc] hover:text-[#0071e3]">
                  前往系统与大模型设置
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="marketing-product-name">产品名称</Label>
              <Input
                id="marketing-product-name"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder="例如：星云智能销售 CRM"
                maxLength={200}
                disabled={generating}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="marketing-target-audience">目标受众</Label>
              <Textarea
                id="marketing-target-audience"
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                placeholder="例如：拥有 20—100 人销售团队、希望提升线索转化效率的 B2B 企业销售负责人"
                rows={4}
                maxLength={1_000}
                disabled={generating}
                required
                className="mt-2 resize-y"
              />
            </div>
            <div>
              <Label htmlFor="marketing-selling-points">核心卖点</Label>
              <Textarea
                id="marketing-selling-points"
                value={sellingPoints}
                onChange={(event) => setSellingPoints(event.target.value)}
                placeholder="每行一个卖点，例如：&#10;AI 自动分析沟通逐字稿&#10;线索评级与风险预警&#10;本地知识库增强销售话术"
                rows={7}
                maxLength={3_000}
                disabled={generating}
                required
                className="mt-2 resize-y"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={generating || !productName.trim() || !targetAudience.trim() || !sellingPoints.trim()}>
              {generating ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  三个场景正在生成
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" />
                  生成营销文案
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="min-h-[42rem]">
        <CardHeader className="border-b border-black/[0.055] pb-4">
          <CardTitle className="text-2xl">AI 文案工作台</CardTitle>
          <CardDescription className="mt-1.5 leading-6">
            三个渠道并行生成，可随时切换标签页查看实时输出。
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Channel)}>
            <TabsList className="grid h-11 w-full grid-cols-3 rounded-2xl bg-[#f5f5f7] p-1">
              {channels.map((channel) => {
                const Icon = channel.icon
                return (
                  <TabsTrigger key={channel.value} value={channel.value} className="h-full rounded-xl px-3 data-active:bg-white data-active:shadow-sm">
                    {outputs[channel.value].pending ? (
                      <LoaderCircle className="size-4 animate-spin text-[#2563eb]" aria-hidden="true" />
                    ) : (
                      <Icon className="size-4" aria-hidden="true" />
                    )}
                    {channel.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {channels.map((channel) => {
              const output = outputs[channel.value]
              return (
                <TabsContent key={channel.value} value={channel.value} className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f]">{channel.label}</h3>
                      <p className="mt-0.5 text-xs text-[#86868b]">
                        {output.pending ? "AI 正在实时撰写…" : output.text ? "文案已生成，可继续编辑后使用" : "等待生成内容"}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" disabled={!output.text.trim()} onClick={() => copyText(channel.value)}>
                      {copiedChannel === channel.value ? (
                        <><Check aria-hidden="true" />已复制</>
                      ) : (
                        <><Copy aria-hidden="true" />一键复制</>
                      )}
                    </Button>
                  </div>

                  <div
                    className={cn(
                      "relative mt-4 min-h-[31rem] rounded-2xl border border-black/[0.06] bg-[#f8fafc] p-5",
                      output.error && "border-red-200 bg-red-50"
                    )}
                  >
                    {output.error ? (
                      <div role="alert" className="flex items-start gap-3 text-sm text-[#b42318]">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                        <p>{output.error}</p>
                      </div>
                    ) : output.text ? (
                      <p className="whitespace-pre-wrap text-[0.95rem] leading-8 text-[#334155]">
                        {output.text}
                        {output.pending && <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-[#2563eb] align-middle" aria-hidden="true" />}
                      </p>
                    ) : (
                      <div className="flex min-h-[27rem] flex-col items-center justify-center text-center">
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                          <channel.icon className="size-5" aria-hidden="true" />
                        </span>
                        <p className="mt-4 font-medium text-[#475569]">{channel.label}将在这里实时生成</p>
                        <p className="mt-1 max-w-sm text-sm leading-6 text-[#94a3b8]">
                          在左侧填写产品信息并提交，三个渠道会同时开始输出。
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
