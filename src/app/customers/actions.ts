"use server"

import { revalidatePath } from "next/cache"

import { customerStatuses } from "@/lib/customer-status"
import {
  createCustomerRecord,
  DuplicatePhoneError,
  normalizePhone,
} from "@/lib/customers"

type CustomerField = "name" | "phone" | "company" | "status"

export type CustomerFormState = {
  success: boolean
  message: string
  fieldErrors?: Partial<Record<CustomerField, string>>
}

export async function createCustomer(
  _previousState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  void _previousState
  const name = String(formData.get("name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const company = String(formData.get("company") ?? "").trim()
  const status = String(formData.get("status") ?? "New")
  const fieldErrors: NonNullable<CustomerFormState["fieldErrors"]> = {}

  if (!name || name.length > 100) fieldErrors.name = "请输入 1 至 100 个字符的客户姓名。"
  if (!phone || phone.length > 30 || !normalizePhone(phone)) {
    fieldErrors.phone = "请输入有效的电话号码。"
  }
  if (!company || company.length > 200) {
    fieldErrors.company = "请输入 1 至 200 个字符的公司名称。"
  }
  if (!customerStatuses.includes(status as (typeof customerStatuses)[number])) {
    fieldErrors.status = "请选择有效的客户状态。"
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, message: "请检查客户信息。", fieldErrors }
  }

  try {
    await createCustomerRecord({ name, phone, company, status })
  } catch (error) {
    if (error instanceof DuplicatePhoneError) {
      return {
        success: false,
        message: "该客户已在库中",
        fieldErrors: { phone: "该电话号码已关联库内客户。" },
      }
    }
    console.error("创建客户失败", error)
    return { success: false, message: "暂时无法创建客户，请稍后重试。" }
  }

  revalidatePath("/customers")
  revalidatePath("/leads")
  return { success: true, message: "客户已成功创建。" }
}
