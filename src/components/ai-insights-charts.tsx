"use client"

import { useId } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  CustomerTrendItem,
  QualityDistributionItem,
} from "@/lib/ai-insights"

const tooltipStyle = {
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: "14px",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
  color: "#1d1d1f",
}

function EmptyPie() {
  return (
    <div className="flex h-[19rem] items-center justify-center text-sm text-[#86868b]">
      暂无客户评级数据
    </div>
  )
}

export function AiInsightsCharts({
  qualityDistribution,
  customerTrend,
}: {
  qualityDistribution: QualityDistributionItem[]
  customerTrend: CustomerTrendItem[]
}) {
  const gradientId = useId().replace(/:/g, "")
  const hasQualityData = qualityDistribution.some((item) => item.value > 0)

  return (
    <section className="grid gap-4 xl:grid-cols-2" aria-label="AI 洞察图表">
      <Card>
        <CardHeader className="border-b border-black/[0.055] pb-4">
          <CardTitle className="text-xl">线索质量分布</CardTitle>
          <p className="text-sm text-[#86868b]">按当前客户质量等级统计</p>
        </CardHeader>
        <CardContent className="pt-1">
          {hasQualityData ? (
            <div className="h-[19rem] w-full" aria-label="线索质量分布饼图">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityDistribution}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="46%"
                    innerRadius={65}
                    outerRadius={102}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {qualityDistribution.map((item) => (
                      <Cell key={item.grade} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${Number(value)} 位客户`, "数量"]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-[#6e6e73]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyPie />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-black/[0.055] pb-4">
          <CardTitle className="text-xl">客户新增趋势</CardTitle>
          <p className="text-sm text-[#86868b]">最近六个自然月新增客户数</p>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="h-[18rem] w-full" aria-label="客户新增趋势柱状图">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#86868b", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#86868b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value)} 位客户`, "新增客户"]}
                  labelFormatter={(label) => `${label}新增`}
                />
                <Bar
                  dataKey="newCustomers"
                  name="新增客户"
                  fill={`url(#${gradientId})`}
                  radius={[8, 8, 3, 3]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
