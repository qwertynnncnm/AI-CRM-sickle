import "server-only"

import { prisma } from "@/lib/prisma"

const HONG_KONG_OFFSET_MS = 8 * 60 * 60 * 1_000
const GRADE_ORDER = ["A", "B", "C", "D"] as const
const GRADE_META: Record<string, { label: string; color: string }> = {
  A: { label: "A 类高意向", color: "#2563eb" },
  B: { label: "B 类重点培育", color: "#06b6d4" },
  C: { label: "C 类持续跟进", color: "#8b5cf6" },
  D: { label: "D 类低优先级", color: "#cbd5e1" },
  OTHER: { label: "其他", color: "#94a3b8" },
}

export type QualityDistributionItem = {
  grade: string
  label: string
  value: number
  color: string
}

export type CustomerTrendItem = {
  month: string
  label: string
  newCustomers: number
}

export type AiInsightsData = {
  totalCustomers: number
  aGradeCustomers: number
  analysisCount: number
  analyzedCustomerCount: number
  aiCoverageRate: number
  qualityDistribution: QualityDistributionItem[]
  customerTrend: CustomerTrendItem[]
}

function getHongKongMonthKey(date: Date) {
  const localDate = new Date(date.getTime() + HONG_KONG_OFFSET_MS)
  const year = localDate.getUTCFullYear()
  const month = String(localDate.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function createMonthBuckets(monthCount = 6) {
  const hongKongNow = new Date(Date.now() + HONG_KONG_OFFSET_MS)
  const currentYear = hongKongNow.getUTCFullYear()
  const currentMonth = hongKongNow.getUTCMonth()

  return Array.from({ length: monthCount }, (_, index) => {
    const monthStart = new Date(
      Date.UTC(currentYear, currentMonth - (monthCount - 1 - index), 1)
    )
    const year = monthStart.getUTCFullYear()
    const month = monthStart.getUTCMonth()
    return {
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: `${month + 1}月`,
      newCustomers: 0,
    }
  })
}

export async function getAiInsightsData(): Promise<AiInsightsData> {
  const monthBuckets = createMonthBuckets()
  const firstMonth = monthBuckets[0]
  const [startYear, startMonth] = (firstMonth?.month ?? "1970-01")
    .split("-")
    .map(Number)
  const trendStart = new Date(
    Date.UTC(startYear, startMonth - 1, 1) - HONG_KONG_OFFSET_MS
  )

  const [totalCustomers, gradeGroups, analysisCount, customerDates, analyzedRows] =
    await Promise.all([
      prisma.customer.count(),
      prisma.customer.groupBy({
        by: ["qualityGrade"],
        _count: { _all: true },
      }),
      prisma.aIAnalysisResult.count(),
      prisma.customer.findMany({
        where: { createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      prisma.aIAnalysisResult.findMany({
        select: {
          interaction: { select: { customerId: true } },
        },
      }),
    ])

  const gradeCounts = new Map(
    gradeGroups.map((group) => [group.qualityGrade.toUpperCase(), group._count._all])
  )
  const knownGradeCount = GRADE_ORDER.reduce(
    (total, grade) => total + (gradeCounts.get(grade) ?? 0),
    0
  )
  const qualityDistribution: QualityDistributionItem[] = GRADE_ORDER.map(
    (grade) => ({
      grade,
      label: GRADE_META[grade].label,
      value: gradeCounts.get(grade) ?? 0,
      color: GRADE_META[grade].color,
    })
  )
  if (knownGradeCount < totalCustomers) {
    qualityDistribution.push({
      grade: "OTHER",
      label: GRADE_META.OTHER.label,
      value: totalCustomers - knownGradeCount,
      color: GRADE_META.OTHER.color,
    })
  }

  const trendByMonth = new Map(monthBuckets.map((item) => [item.month, item]))
  for (const customer of customerDates) {
    const monthKey = getHongKongMonthKey(customer.createdAt)
    const bucket = trendByMonth.get(monthKey)
    if (bucket) bucket.newCustomers += 1
  }

  const analyzedCustomerCount = new Set(
    analyzedRows.map((row) => row.interaction.customerId)
  ).size

  return {
    totalCustomers,
    aGradeCustomers: gradeCounts.get("A") ?? 0,
    analysisCount,
    analyzedCustomerCount,
    aiCoverageRate:
      totalCustomers > 0
        ? Math.round((analyzedCustomerCount / totalCustomers) * 1_000) / 10
        : 0,
    qualityDistribution,
    customerTrend: monthBuckets,
  }
}
