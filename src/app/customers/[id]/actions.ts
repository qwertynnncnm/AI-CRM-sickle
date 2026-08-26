"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"

export type InteractionFormState = {
  success: boolean
  message: string
  createdId?: number
  fieldErrors?: { rawContent?: string }
}

export async function createInteraction(
  customerId: number,
  _previousState: InteractionFormState,
  formData: FormData
): Promise<InteractionFormState> {
  void _previousState
  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    return { success: false, message: "客户编号无效。" }
  }
  const rawContent = String(formData.get("rawContent") ?? "").trim()
  if (!rawContent || rawContent.length > 100_000) {
    return {
      success: false,
      message: "请检查沟通原文。",
      fieldErrors: { rawContent: "沟通原文须为 1 至 100000 个字符。" },
    }
  }

  try {
    const interaction = await prisma.interaction.create({
      data: { customerId, rawContent, transcript: "[]" },
    })
    revalidatePath(`/customers/${customerId}`)
    revalidatePath("/leads")
    return { success: true, message: "沟通记录已添加。", createdId: interaction.id }
  } catch (error) {
    console.error("添加沟通记录失败", error)
    return { success: false, message: "暂时无法保存沟通记录。" }
  }
}
