"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  LoaderCircle,
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
import { Textarea } from "@/components/ui/textarea"

type QuickEntryResult = {
  customer: {
    id: number
    name: string
    created: boolean
  }
  interaction: {
    id: number
    summary: string
  }
}

export function QuickEntry() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [pending, setPending] = useState(false)
  const [needsConfiguration, setNeedsConfiguration] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = text.trim()
    if (!content || pending) return

    setPending(true)
    setNeedsConfiguration(false)

    try {
      const response = await fetch("/api/quick-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      })

      if (response.status === 401) {
        setNeedsConfiguration(true)
        return
      }

      const body = (await response.json().catch(() => null)) as
        | QuickEntryResult
        | { error?: string }
        | null

      if (!response.ok || !body || !("customer" in body)) {
        throw new Error(
          body && "error" in body && body.error
            ? body.error
            : "智能解析失败，请稍后重试。"
        )
      }

      setText("")
      toast.success("客户沟通记录已录入", {
        description: body.customer.created
          ? `已新建客户“${body.customer.name}”并添加沟通纪要。`
          : `已将沟通纪要添加到客户“${body.customer.name}”。`,
        action: {
          label: "查看客户",
          onClick: () => router.push(`/customers/${body.customer.id}`),
        },
      })
      router.refresh()
    } catch (error) {
      toast.error("录入失败", {
        description:
          error instanceof Error ? error.message : "智能解析失败，请稍后重试。",
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="relative overflow-hidden bg-[radial-gradient(circle_at_82%_0%,rgba(175,82,222,0.26),transparent_32%),radial-gradient(circle_at_55%_120%,rgba(0,122,255,0.24),transparent_38%),linear-gradient(135deg,#ffffff_0%,#edf6ff_100%)] shadow-[0_18px_50px_rgba(0,113,227,0.1)] [--card-spacing:--spacing(7)]">
      <CardHeader className="border-b border-black/[0.055] pb-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.22)]">
            <WandSparkles className="size-[1.1rem]" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-2xl tracking-[-0.03em] text-[#1d1d1f]">AI 闪电录入</CardTitle>
            <CardDescription className="mt-1.5 max-w-2xl leading-6 text-[#6e6e73]">
              粘贴一段客户沟通原文，系统会自动识别客户并生成沟通纪要。
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {needsConfiguration && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-2xl border border-[#ff9f0a]/20 bg-[#fff8e8] px-4 py-3 text-[#633c00]"
          >
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-[#c93400]"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">
                未检测到大模型 API 配置，请前往设置页面填写 API Key 与 Base URL
              </p>
              <Link
                href="/settings"
                className="mt-1.5 inline-flex text-sm font-medium text-[#0066cc] hover:text-[#0071e3]"
              >
                前往设置页面
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="quick-entry-text" className="sr-only">
            客户沟通原文
          </label>
          <Textarea
            id="quick-entry-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={10000}
            placeholder="例如：今天和王经理电话沟通，他希望下周收到企业版报价，并重点关注数据安全和部署周期……"
            disabled={pending}
            className="min-h-40 resize-y border-white/80 bg-white/72 shadow-[0_8px_30px_rgba(0,0,0,0.055)] backdrop-blur-xl"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-[#86868b]">
              <Sparkles className="size-3.5 text-[#0071e3]" aria-hidden="true" />
              自动查找或新建客户，并关联保存本次沟通
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={pending || !text.trim()}
              className="sm:self-end"
            >
              {pending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  正在解析并录入
                </>
              ) : (
                <>
                  <WandSparkles aria-hidden="true" />
                  智能解析并录入
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
