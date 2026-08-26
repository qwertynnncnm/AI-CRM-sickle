import { revalidatePath } from "next/cache"
import { z } from "zod"

import { customerStatuses } from "@/lib/customer-status"
import { createCustomerRecord, DuplicatePhoneError } from "@/lib/customers"

export const runtime = "nodejs"

const schema = z
  .object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(1).max(30),
    company: z.string().trim().min(1).max(200),
    status: z.enum(customerStatuses).optional(),
  })
  .strict()

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "请求内容不是有效的 JSON。" }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "客户信息不完整或格式无效。" }, { status: 400 })
  }

  try {
    const customer = await createCustomerRecord(parsed.data)
    revalidatePath("/customers")
    revalidatePath("/leads")
    return Response.json({ customer }, { status: 201 })
  } catch (error) {
    if (error instanceof DuplicatePhoneError) {
      return Response.json({ error: "该客户已在库中" }, { status: 409 })
    }
    console.error("客户 API 创建失败", error)
    return Response.json({ error: "暂时无法创建客户。" }, { status: 500 })
  }
}
