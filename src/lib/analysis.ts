import { z } from "zod"

export const transcriptLineSchema = z
  .object({
    lineIndex: z.number().int().nonnegative(),
    speaker: z.string().trim().min(1).max(100),
    text: z.string().trim().min(1).max(10_000),
  })
  .strict()

export const traceablePointSchema = z
  .object({
    point: z.string().trim().min(1).max(2_000),
    sourceLineIndices: z.array(z.number().int().nonnegative()).max(100),
  })
  .strict()

export type TranscriptLine = z.infer<typeof transcriptLineSchema>
export type TraceablePoint = z.infer<typeof traceablePointSchema>

export function parseTranscript(value: string): TranscriptLine[] {
  try {
    const parsed = z.array(transcriptLineSchema).safeParse(JSON.parse(value))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

export function parseTraceablePoints(value: string): TraceablePoint[] {
  try {
    const parsed = z.array(traceablePointSchema).safeParse(JSON.parse(value))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

export function serializeTranscript(lines: TranscriptLine[]) {
  return JSON.stringify(lines)
}

export function serializeTraceablePoints(points: TraceablePoint[]) {
  return JSON.stringify(points)
}
