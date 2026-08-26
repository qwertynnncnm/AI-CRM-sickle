"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Link2,
  MessageSquareText,
  Target,
} from "lucide-react"

import type { TraceablePoint, TranscriptLine } from "@/lib/analysis"
import { cn } from "@/lib/utils"

export type AnalysisSession = {
  id: number
  createdAt: string
  rawContent: string
  transcript: TranscriptLine[]
  analysis: null | {
    summary: string
    negotiationStrategy: TraceablePoint[]
    roadblocks: TraceablePoint[]
  }
}

type AnalysisCard = TraceablePoint & {
  id: string
  type: "strategy" | "roadblock"
}

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Hong_Kong",
})

export function ImmersiveAnalysisView({ sessions }: { sessions: AnalysisSession[] }) {
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id ?? 0)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const [pinnedCardId, setPinnedCardId] = useState<string | null>(null)
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null)
  const [pinnedLineIndex, setPinnedLineIndex] = useState<number | null>(null)
  const lineRefs = useRef(new Map<number, HTMLLIElement>())
  const transcriptRef = useRef<HTMLOListElement>(null)

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? sessions[0] ?? null
  const cards = useMemo<AnalysisCard[]>(() => {
    if (!selectedSession?.analysis) return []
    return [
      ...selectedSession.analysis.negotiationStrategy.map((item, index) => ({
        ...item,
        id: `strategy-${index}`,
        type: "strategy" as const,
      })),
      ...selectedSession.analysis.roadblocks.map((item, index) => ({
        ...item,
        id: `roadblock-${index}`,
        type: "roadblock" as const,
      })),
    ]
  }, [selectedSession])

  const activeCardId = pinnedCardId ?? hoveredCardId
  const activeCard = cards.find((card) => card.id === activeCardId) ?? null
  const activeLineIndex = pinnedLineIndex ?? hoveredLineIndex
  const highlightedLineIndices = new Set(activeCard?.sourceLineIndices ?? [])

  useEffect(() => {
    const firstSourceLineIndex = activeCard?.sourceLineIndices[0]
    if (firstSourceLineIndex === undefined) return

    const animationFrame = requestAnimationFrame(() => {
      const target = lineRefs.current.get(firstSourceLineIndex)
      const container = transcriptRef.current
      if (!target || !container) return

      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const targetTop = targetRect.top - containerRect.top + container.scrollTop
      container.scrollTo({
        top: Math.max(0, targetTop - container.clientHeight / 2 + targetRect.height / 2),
        behavior: "smooth",
      })
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [activeCard])

  function activateCard(card: AnalysisCard) {
    setHoveredCardId(card.id)
  }

  function selectSession(sessionId: number) {
    setSelectedSessionId(sessionId)
    setHoveredCardId(null)
    setPinnedCardId(null)
    setHoveredLineIndex(null)
    setPinnedLineIndex(null)
    lineRefs.current.clear()
  }

  if (!selectedSession) {
    return (
      <div className="flex min-h-[34rem] items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white">
        <div className="text-center">
          <MessageSquareText className="mx-auto size-9 text-[#cbd5e1]" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-[#475569]">暂无沟通分析</p>
          <p className="mt-1 text-xs text-[#94a3b8]">提交逐字稿并完成 AI 分析后将在这里展示。</p>
        </div>
      </div>
    )
  }

  const strategyCards = cards.filter((card) => card.type === "strategy")
  const roadblockCards = cards.filter((card) => card.type === "roadblock")

  function renderCard(card: AnalysisCard) {
    const linkedFromTranscript =
      activeLineIndex !== null && card.sourceLineIndices.includes(activeLineIndex)
    const active = card.id === activeCardId || linkedFromTranscript
    const pinned = card.id === pinnedCardId
    const isRoadblock = card.type === "roadblock"

    return (
      <button
        key={card.id}
        type="button"
        aria-pressed={pinned}
        data-analysis-card={card.id}
        onMouseEnter={() => activateCard(card)}
        onMouseLeave={() => setHoveredCardId(null)}
        onFocus={() => activateCard(card)}
        onBlur={() => setHoveredCardId(null)}
        onClick={() => {
          setPinnedCardId((current) => (current === card.id ? null : card.id))
        }}
        className={cn(
          "group w-full rounded-2xl border p-4 text-left outline-none transition-all duration-200 focus-visible:ring-3 focus-visible:ring-[#2563eb]/20",
          isRoadblock
            ? "border-[#fb923c]/15 bg-[#fff7ed] hover:border-[#fb923c]/35"
            : "border-[#2563eb]/12 bg-[#eff6ff] hover:border-[#2563eb]/30",
          active &&
            (isRoadblock
              ? "border-[#f97316]/45 bg-[#ffedd5] shadow-[0_8px_24px_rgba(249,115,22,0.12)] ring-2 ring-[#f97316]/15"
              : "border-[#2563eb]/40 bg-[#dbeafe] shadow-[0_8px_24px_rgba(37,99,235,0.12)] ring-2 ring-[#2563eb]/15")
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
              isRoadblock ? "bg-[#f97316] text-white" : "bg-[#2563eb] text-white"
            )}
          >
            {isRoadblock ? (
              <AlertTriangle className="size-4" aria-hidden="true" />
            ) : (
              <Target className="size-4" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-6 text-[#1e293b]">
              {card.point}
            </span>
            <span className="mt-2 flex items-center gap-1.5 text-[0.68rem] font-medium text-[#64748b]">
              <Link2 className="size-3" aria-hidden="true" />
              关联 {card.sourceLineIndices.length} 行原文
              {pinned && (
                <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-[#2563eb]">
                  已锁定
                </span>
              )}
            </span>
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="grid min-h-[calc(100vh-12rem)] overflow-hidden rounded-[1.75rem] border border-black/[0.065] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] xl:h-[calc(100vh-12rem)] xl:min-h-[38rem] xl:grid-cols-[minmax(22rem,0.88fr)_minmax(30rem,1.12fr)]">
      <section className="flex min-h-0 flex-col border-b border-black/[0.06] bg-[#f8fafc] xl:border-r xl:border-b-0">
        <header className="border-b border-black/[0.06] bg-white/90 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-[#64748b] uppercase">
                AI 分析结论
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#0f172a]">谈单策略与成交卡点</h3>
            </div>
            {sessions.length > 1 && (
              <select
                value={selectedSession.id}
                onChange={(event) => selectSession(Number(event.target.value))}
                aria-label="选择沟通记录"
                className="h-8 max-w-40 rounded-lg border border-black/10 bg-white px-2 text-xs outline-none focus:ring-3 focus:ring-[#2563eb]/15"
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {formatter.format(new Date(session.createdAt))}
                  </option>
                ))}
              </select>
            )}
          </div>
          {selectedSession.analysis?.summary && (
            <div className="mt-4 rounded-2xl border border-black/[0.05] bg-white px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                <FileText className="size-3.5" aria-hidden="true" /> 全局摘要
              </p>
              <p className="mt-2 text-sm leading-6 text-[#475569]">{selectedSession.analysis.summary}</p>
            </div>
          )}
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 [scrollbar-width:thin]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#334155]">谈单思路</h4>
              <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-[0.65rem] font-semibold text-[#1d4ed8]">
                {strategyCards.length}
              </span>
            </div>
            <div className="space-y-3">
              {strategyCards.length ? strategyCards.map(renderCard) : (
                <p className="rounded-2xl border border-dashed border-black/10 px-4 py-6 text-center text-xs text-[#94a3b8]">
                  暂无谈单策略
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#334155]">成交卡点</h4>
              <span className="rounded-full bg-[#ffedd5] px-2 py-0.5 text-[0.65rem] font-semibold text-[#c2410c]">
                {roadblockCards.length}
              </span>
            </div>
            <div className="space-y-3">
              {roadblockCards.length ? roadblockCards.map(renderCard) : (
                <p className="rounded-2xl border border-dashed border-black/10 px-4 py-6 text-center text-xs text-[#94a3b8]">
                  暂无成交卡点
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-col bg-white">
        <header className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-[#64748b] uppercase">
              Transcript
            </p>
            <h3 className="mt-1 text-base font-semibold text-[#0f172a]">沟通逐字稿</h3>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[0.68rem] font-medium text-[#64748b]">
            <CheckCircle2 className="size-3.5 text-[#16a34a]" aria-hidden="true" />
            {selectedSession.transcript.length} 行已解析
          </span>
        </header>

        <ol
          ref={transcriptRef}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#f8fafc]/65 p-5 [scrollbar-width:thin]"
        >
          {selectedSession.transcript.length ? selectedSession.transcript.map((line) => {
            const highlighted = highlightedLineIndices.has(line.lineIndex)
            const selectedFromTranscript = activeLineIndex === line.lineIndex
            const isCustomer = /客户|买方|用户/.test(line.speaker)
            return (
              <li
                key={line.lineIndex}
                ref={(node) => {
                  if (node) lineRefs.current.set(line.lineIndex, node)
                  else lineRefs.current.delete(line.lineIndex)
                }}
                data-line-index={line.lineIndex}
                onMouseEnter={() => setHoveredLineIndex(line.lineIndex)}
                onMouseLeave={() => setHoveredLineIndex(null)}
                onClick={() =>
                  setPinnedLineIndex((current) =>
                    current === line.lineIndex ? null : line.lineIndex
                  )
                }
                className={cn(
                  "group scroll-m-6 rounded-2xl border border-transparent bg-white px-4 py-3 transition-all duration-300",
                  highlighted &&
                    "border-[#f59e0b]/35 bg-[#fef3c7] shadow-[0_8px_24px_rgba(245,158,11,0.14)] ring-2 ring-[#f59e0b]/15",
                  selectedFromTranscript && !highlighted &&
                    "border-[#2563eb]/25 bg-[#eff6ff] ring-2 ring-[#2563eb]/10"
                )}
              >
                <span className="sr-only">原文行号 {line.lineIndex}</span>
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex shrink-0 rounded-lg px-2 py-1 text-[0.68rem] font-semibold",
                      isCustomer
                        ? "bg-[#dbeafe] text-[#1d4ed8]"
                        : "bg-[#dcfce7] text-[#15803d]"
                    )}
                  >
                    {line.speaker}
                  </span>
                  <p className="min-w-0 flex-1 text-sm leading-7 text-[#334155]">{line.text}</p>
                  {highlighted && (
                    <Link2 className="mt-1 size-3.5 shrink-0 text-[#d97706]" aria-label="已被分析结论引用" />
                  )}
                </div>
              </li>
            )
          }) : (
            <li className="flex h-full min-h-72 items-center justify-center text-sm text-[#94a3b8]">
              该记录暂无解析后的逐字稿
            </li>
          )}
        </ol>
      </section>
    </div>
  )
}
