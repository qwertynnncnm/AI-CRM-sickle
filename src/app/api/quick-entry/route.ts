import { createOpenAI } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { normalizePhone } from "@/lib/customers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const extractionSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(30),
  company: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2_000),
})

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  const setting = await prisma.systemSetting.findUnique({
    where: { id: 1 },
    select: { apiKey: true, baseUrl: true, modelName: true },
  })
  if (!setting?.apiKey) return errorResponse("未配置大模型 API Key。", 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse("请求内容不是有效的 JSON。", 400)
  }
  const text = String((body as Record<string, unknown> | null)?.text ?? "").trim()
  if (!text || text.length > 10_000) return errorResponse("录入内容为空或过长。", 400)

  const provider = createOpenAI({
    apiKey: setting.apiKey,
    ...(setting.baseUrl ? { baseURL: setting.baseUrl } : {}),
    name: "configured-compatible-provider",
  })

  let extracted: z.infer<typeof extractionSchema>
  try {
    const result = await generateText({
      model: provider.chat(setting.modelName || "deepseek-chat"),
      output: Output.object({ schema: extractionSchema }),
      instructions: "从输入中提取客户姓名、电话号码、公司名称和沟通摘要。不得编造；缺少电话号码或公司时无法完成标准化录入。",
      prompt: text,
      maxOutputTokens: 800,
      maxRetries: 1,
      abortSignal: request.signal,
      timeout: { totalMs: 60_000 },
    })
    extracted = result.output
  } catch {
    return errorResponse("大模型解析失败，请检查 API 配置。", 502)
  }

  const phone = normalizePhone(extracted.phone)
  if (!phone) return errorResponse("未能提取有效电话号码。", 422)

  try {
    const saved = await prisma.$transaction(async (transaction) => {
      let customer = await transaction.customer.findUnique({ where: { phone } })
      let customerCreated = false
      if (!customer) {
        customer = await transaction.customer.create({
          data: {
            name: extracted.customerName,
            phone,
            company: extracted.company,
            status: "New",
          },
        })
        customerCreated = true
      }
      const interaction = await transaction.interaction.create({
        data: { customerId: customer.id, rawContent: text, transcript: "[]" },
      })
      return { customer, interaction, customerCreated }
    })

    revalidatePath("/")
    revalidatePath("/leads")
    revalidatePath(`/customers/${saved.customer.id}`)
    return Response.json({
      customer: { id: saved.customer.id, name: saved.customer.name, created: saved.customerCreated },
      interaction: { id: saved.interaction.id, summary: extracted.summary },
    })
  } catch (error) {
    console.error("AI 闪电录入失败", error)
    return errorResponse("解析成功，但保存记录时发生错误。", 500)
  }
}
