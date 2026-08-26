"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"

export type KnowledgeFormState = {
  success: boolean
  message: string
  fieldErrors?: Partial<Record<"question" | "answer", string>>
}

function validateKnowledgeForm(formData: FormData) {
  const question = String(formData.get("question") ?? "").trim()
  const answer = String(formData.get("answer") ?? "").trim()
  const fieldErrors: NonNullable<KnowledgeFormState["fieldErrors"]> = {}

  if (!question) fieldErrors.question = "请输入客户常见问题。"
  else if (question.length > 500) fieldErrors.question = "问题不能超过 500 个字符。"

  if (!answer) fieldErrors.answer = "请输入标准话术。"
  else if (answer.length > 10_000) fieldErrors.answer = "标准话术不能超过 10000 个字符。"

  return { question, answer, fieldErrors }
}

export async function createKnowledgeEntry(
  _previousState: KnowledgeFormState,
  formData: FormData
): Promise<KnowledgeFormState> {
  const { question, answer, fieldErrors } = validateKnowledgeForm(formData)
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, message: "请检查知识内容。", fieldErrors }
  }

  try {
    await prisma.knowledgeBase.create({ data: { question, answer } })
    revalidatePath("/knowledge-base")
    return { success: true, message: "知识条目已创建。" }
  } catch (error) {
    console.error("创建知识库条目失败", error)
    return { success: false, message: "暂时无法保存知识条目，请稍后重试。" }
  }
}

export async function updateKnowledgeEntry(
  id: number,
  _previousState: KnowledgeFormState,
  formData: FormData
): Promise<KnowledgeFormState> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { success: false, message: "知识条目编号无效。" }
  }

  const { question, answer, fieldErrors } = validateKnowledgeForm(formData)
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, message: "请检查知识内容。", fieldErrors }
  }

  try {
    await prisma.knowledgeBase.update({ where: { id }, data: { question, answer } })
    revalidatePath("/knowledge-base")
    return { success: true, message: "知识条目已更新。" }
  } catch (error) {
    console.error("更新知识库条目失败", error)
    return { success: false, message: "知识条目不存在或暂时无法更新。" }
  }
}

export async function deleteKnowledgeEntry(
  id: number,
  _previousState: KnowledgeFormState,
  _formData: FormData
): Promise<KnowledgeFormState> {
  void _previousState
  void _formData

  if (!Number.isSafeInteger(id) || id <= 0) {
    return { success: false, message: "知识条目编号无效。" }
  }

  try {
    await prisma.knowledgeBase.delete({ where: { id } })
    revalidatePath("/knowledge-base")
    return { success: true, message: "知识条目已删除。" }
  } catch (error) {
    console.error("删除知识库条目失败", error)
    return { success: false, message: "知识条目不存在或暂时无法删除。" }
  }
}
