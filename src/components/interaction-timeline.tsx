"use client"

import { useState } from "react"
import { FileText, Link2, MessageSquareText, Target } from "lucide-react"

import type { TraceablePoint, TranscriptLine } from "@/lib/analysis"

type TimelineInteraction = {
  id: number
  rawContent: string
  transcript: TranscriptLine[]
  createdAt: string
  analysis: null | {
    summary: string
    negotiationStrategy: TraceablePoint[]
    roadblocks: TraceablePoint[]
  }
}

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Hong_Kong",
})

function TraceableList({
  title,
  points,
  onSelect,
}: {
  title: string
  points: TraceablePoint[]
  onSelect: (indices: number[]) => void
}) {
  if (points.length === 0) return null
  return (
    <div>
      <p className="text-xs font-semibold text-[#6e6e73]">{title}</p>
      <ul className="mt-2 space-y-2">
        {points.map((item, index) => (
          <li key={`${item.point}-${index}`}>
            <button
              type="button"
              onClick={() => onSelect(item.sourceLineIndices)}
              className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-left text-sm leading-6 text-[#424245] transition hover:bg-[#eaf4ff]"
            >
              {item.point}
              {item.sourceLineIndices.length > 0 && (
                <span className="mt-1 flex items-center gap-1 text-[0.68rem] text-[#0066cc]">
                  <Link2 className="size-3" aria-hidden="true" />
                  来源行：{item.sourceLineIndices.join("、")}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TimelineItem({ interaction }: { interaction: TimelineInteraction }) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const selected = new Set(selectedIndices)

  return (
    <article className="relative pl-8">
      <span className="absolute left-0 top-1 flex size-5 items-center justify-center rounded-full bg-[#0071e3] text-white ring-4 ring-white">
        <MessageSquareText className="size-3" aria-hidden="true" />
      </span>
      <div className="rounded-2xl border border-black/[0.055] bg-white p-4 shadow-sm">
        <time className="text-xs text-[#86868b]" dateTime={interaction.createdAt}>
          {formatter.format(new Date(interaction.createdAt))}
        </time>

        {interaction.analysis ? (
          <div className="mt-3 space-y-4">
            <div className="rounded-xl bg-[#eaf4ff] px-3 py-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#0066cc]">
                <FileText className="size-3.5" aria-hidden="true" /> AI 摘要
              </p>
              <p className="mt-2 text-sm leading-6 text-[#334155]">{interaction.analysis.summary}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <TraceableList
                title="谈单策略"
                points={interaction.analysis.negotiationStrategy}
                onSelect={setSelectedIndices}
              />
              <TraceableList
                title="成交卡点"
                points={interaction.analysis.roadblocks}
                onSelect={setSelectedIndices}
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#424245]">
            {interaction.rawContent}
          </p>
        )}

        {interaction.transcript.length > 0 && (
          <div className="mt-4 border-t border-black/[0.055] pt-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#6e6e73]">
              <Target className="size-3.5" aria-hidden="true" /> 可溯源逐字稿
            </p>
            <ol className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
              {interaction.transcript.map((line) => (
                <li
                  key={line.lineIndex}
                  className={`rounded-xl px-3 py-2 text-sm leading-6 transition ${
                    selected.has(line.lineIndex)
                      ? "bg-[#fff2cc] text-[#633c00] ring-1 ring-[#ff9f0a]/25"
                      : "bg-[#f5f5f7] text-[#424245]"
                  }`}
                >
                  <span className="mr-2 font-mono text-[0.68rem] text-[#86868b]">
                    #{line.lineIndex}
                  </span>
                  <strong className="mr-2 text-xs">{line.speaker}</strong>
                  {line.text}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </article>
  )
}

export function InteractionTimeline({ interactions }: { interactions: TimelineInteraction[] }) {
  if (interactions.length === 0) {
    return <p className="py-10 text-center text-sm text-[#86868b]">暂无沟通记录</p>
  }
  return (
    <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[0.6rem] before:top-2 before:w-px before:bg-black/10">
      {interactions.map((interaction) => (
        <TimelineItem key={interaction.id} interaction={interaction} />
      ))}
    </div>
  )
}
