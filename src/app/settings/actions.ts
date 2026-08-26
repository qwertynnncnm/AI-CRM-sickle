"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"

type SettingField = "apiKey" | "baseUrl" | "modelName"

export type AiSettingsFormState = {
  success: boolean
  message: string
  savedAt?: number
  fieldErrors?: Partial<Record<SettingField, string>>
}

export async function saveAiSettings(
  _previousState: AiSettingsFormState,
  formData: FormData
): Promise<AiSettingsFormState> {
  void _previousState
  const apiKey = String(formData.get("apiKey") ?? "").trim()
  const baseUrl = String(formData.get("baseUrl") ?? "").trim()
  const modelName = String(formData.get("modelName") ?? "").trim()
  const fieldErrors: NonNullable<AiSettingsFormState["fieldErrors"]> = {}

  if (apiKey.length > 512 || (apiKey && /\s/.test(apiKey))) {
    fieldErrors.apiKey = "API Key 格式无效。"
  }
  if (baseUrl.length > 2048) {
    fieldErrors.baseUrl = "Base URL 不能超过 2048 个字符。"
  } else if (baseUrl) {
    try {
      const url = new URL(baseUrl)
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
        fieldErrors.baseUrl = "请输入不含账号密码的 HTTP 或 HTTPS 地址。"
      }
    } catch {
      fieldErrors.baseUrl = "请输入完整有效的 Base URL。"
    }
  }
  if (modelName.length > 200 || (modelName && /\s/.test(modelName))) {
    fieldErrors.modelName = "模型名称格式无效。"
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, message: "请检查配置内容。", fieldErrors }
  }

  try {
    await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: {
        ...(apiKey ? { apiKey } : {}),
        baseUrl: baseUrl || null,
        modelName: modelName || null,
      },
      create: {
        id: 1,
        apiKey: apiKey || null,
        baseUrl: baseUrl || null,
        modelName: modelName || null,
      },
    })
  } catch (error) {
    console.error("保存大模型配置失败", error)
    return { success: false, message: "暂时无法保存配置，请稍后重试。" }
  }

  revalidatePath("/settings")
  return { success: true, message: "大模型 API 配置已保存。", savedAt: Date.now() }
}
