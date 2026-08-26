"use client"

import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Bot,
  LoaderCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const suggestions = [
  "总结客户现状并给出下一步建议",
  "帮我起草一封跟进邮件",
  "分析这位客户可能的成交风险",
]

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function AiCopilot({ customerId }: { customerId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfiguration, setNeedsConfiguration] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = input.trim()
    if (!content || pending) return

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content,
    }
    const assistantMessage: ChatMessage = {
      id: createMessageId(),
      role: "assistant",
      content: "",
    }
    const conversation = [...messages, userMessage]
    const controller = new AbortController()
    abortControllerRef.current = controller

    setInput("")
    setError(null)
    setNeedsConfiguration(false)
    setPending(true)
    setMessages([...conversation, assistantMessage])

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          messages: conversation.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
        signal: controller.signal,
      })

      if (response.status === 401) {
        setNeedsConfiguration(true)
        setMessages(conversation)
        return
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(body?.error || "AI 服务请求失败，请稍后重试。")
      }

      if (!response.body) {
        throw new Error("AI 服务没有返回可读取的内容。")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let answer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        answer += decoder.decode(value, { stream: true })
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: answer }
              : message
          )
        )
      }

      answer += decoder.decode()
      if (!answer.trim()) {
        setMessages(conversation)
        throw new Error("模型没有返回文本内容，请检查模型名称与接口配置。")
      }
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return
      }

      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) => message.id !== assistantMessage.id || message.content
        )
      )
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI 服务请求失败，请稍后重试。"
      )
    } finally {
      setPending(false)
      abortControllerRef.current = null
    }
  }

  return (
    <Card className="bg-[linear-gradient(145deg,#ffffff_0%,#f5faff_100%)] shadow-[0_14px_40px_rgba(0,113,227,0.07)]">
      <CardHeader className="border-b border-black/[0.055] pb-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.2)]">
            <Sparkles className="size-[1.1rem]" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-xl tracking-[-0.025em]">AI 销售助理</CardTitle>
            <CardDescription className="mt-1.5 leading-6">
              基于当前客户资料和全部交互历史提供销售建议。
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsConfiguration && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-[#ff9f0a]/20 bg-[#fff8e8] px-4 py-3 text-[#633c00]"
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

        <div
          role="log"
          aria-live="polite"
          aria-label="AI 对话记录"
          className="max-h-[28rem] min-h-44 space-y-4 overflow-y-auto rounded-2xl bg-[#f5f5f7] p-4 ring-1 ring-black/[0.035]"
        >
          {messages.length === 0 ? (
            <div className="flex min-h-36 flex-col items-center justify-center text-center">
              <Bot className="size-6 text-[#0071e3]" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-[#1d1d1f]">
                我已准备好分析这位客户
              </p>
              <p className="mt-1 text-xs leading-5 text-[#6e6e73]">
                你可以询问跟进策略、成交风险或沟通话术。
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-[#1d1d1f] text-white"
                      : "bg-[#eaf4ff] text-[#0071e3]"
                  }`}
                >
                  {message.role === "user" ? (
                    <UserRound className="size-4" aria-hidden="true" />
                  ) : (
                    <Bot className="size-4" aria-hidden="true" />
                  )}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-[#0071e3] text-white"
                      : "rounded-tl-sm bg-white text-[#424245] shadow-[0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.055]"
                  }`}
                >
                  {message.content ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[#86868b]">
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      正在思考
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2" aria-label="推荐问题">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="rounded-full border border-black/[0.075] bg-white px-3.5 py-1.5 text-xs text-[#424245] outline-none transition-all hover:border-[#0071e3]/20 hover:bg-[#eaf4ff] hover:text-[#0066cc] focus-visible:ring-2 focus-visible:ring-[#0071e3]/25"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-[#fff0f0] px-3 py-2 text-sm text-[#b42318]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="copilot-message" className="sr-only">
              向 AI 销售助理提问
            </label>
            <Textarea
              id="copilot-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              maxLength={4000}
              placeholder="询问客户总结、跟进建议或销售话术……"
              disabled={pending}
              className="min-h-20 resize-y"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={pending || !input.trim()}
            className="sm:mb-0.5"
          >
            {pending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                生成中
              </>
            ) : (
              <>
                <Send aria-hidden="true" />
                发送
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
