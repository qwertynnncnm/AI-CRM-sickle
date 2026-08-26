"use server"

import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

import { getAiInsightsData } from "@/lib/ai-insights"
import { prisma } from "@/lib/prisma"

export type TeamReportState = {
  success: boolean
  message: string
  report?: string
  needsConfiguration?: boolean
  generatedAt?: string
}

export async function generateTeamReport(
  _previousState: TeamReportState,
  _formData: FormData
): Promise<TeamReportState> {
  void _previousState
  void _formData

  const [setting, insights] = await Promise.all([
    prisma.systemSetting.findUnique({
      where: { id: 1 },
      select: { apiKey: true, baseUrl: true, modelName: true },
    }),
    getAiInsightsData(),
  ])

  if (!setting?.apiKey) {
    return {
      success: false,
      message: "未检测到大模型 API 配置，请先填写 API Key 与 Base URL。",
      needsConfiguration: true,
    }
  }

  const provider = createOpenAI({
    apiKey: setting.apiKey,
    ...(setting.baseUrl ? { baseURL: setting.baseUrl } : {}),
    name: "configured-compatible-provider",
  })

  try {
    const result = await generateText({
      model: provider.chat(setting.modelName || "deepseek-chat"),
      instructions: `你是一名中国 B2B 销售团队的经营分析负责人。请根据系统提供的真实聚合数据，生成一份简洁、专业、可执行的中文团队战报。

输出要求：
1. 仅输出纯文本，不使用 Markdown 标题符号或表格。
2. 分为“经营概览”“关键判断”“下阶段动作”三个自然段。
3. 必须引用输入中的具体数字，但不得编造增长率、成交额、目标完成率或团队成员表现。
4. 对没有数据支撑的结论明确使用“暂无法判断”。
5. 下阶段动作给出 2 至 4 条管理建议，重点关注 A 类线索、AI 分析覆盖和客户新增趋势。`,
      prompt: JSON.stringify({
        generatedDate: new Intl.DateTimeFormat("zh-CN", {
          dateStyle: "long",
          timeZone: "Asia/Hong_Kong",
        }).format(new Date()),
        metrics: insights,
      }),
      maxOutputTokens: 1_500,
      maxRetries: 1,
      timeout: { totalMs: 90_000 },
    })

    const report = result.text.trim()
    if (!report) throw new Error("模型返回了空战报。")

    return {
      success: true,
      message: "团队战报已生成。",
      report,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("生成团队战报失败", error)
    return {
      success: false,
      message: "团队战报生成失败，请检查模型配置或稍后重试。",
    }
  }
}
