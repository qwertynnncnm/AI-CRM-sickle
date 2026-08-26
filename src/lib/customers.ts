import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export class DuplicatePhoneError extends Error {
  constructor() {
    super("该客户已在库中")
    this.name = "DuplicatePhoneError"
  }
}

export function normalizePhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/\D/g, "")
  if (!digits) return null
  return `${trimmed.startsWith("+") ? "+" : ""}${digits}`
}

type CreateCustomerInput = {
  name: string
  phone: string
  company: string
  status?: string
}

export async function createCustomerRecord(input: CreateCustomerInput) {
  const phone = normalizePhone(input.phone)
  if (!phone) throw new Error("电话号码格式无效。")

  const existingCustomer = await prisma.customer.findUnique({
    where: { phone },
    select: { id: true },
  })
  if (existingCustomer) throw new DuplicatePhoneError()

  try {
    return await prisma.customer.create({
      data: {
        name: input.name.trim(),
        phone,
        company: input.company.trim(),
        status: input.status?.trim() || "New",
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicatePhoneError()
    }
    throw error
  }
}
