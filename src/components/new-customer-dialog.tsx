"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { LoaderCircle, Plus } from "lucide-react"

import { createCustomer, type CustomerFormState } from "@/app/customers/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: CustomerFormState = { success: false, message: "" }

function CustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(createCustomer, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onSuccess()
    }
  }, [onSuccess, state.success])

  const fields = [
    { name: "name", label: "姓名", placeholder: "例如：王欣", type: "text", maxLength: 100 },
    { name: "phone", label: "电话", placeholder: "例如：138 0000 0000", type: "tel", maxLength: 30 },
    { name: "company", label: "公司", placeholder: "例如：远景科技", type: "text", maxLength: 200 },
  ] as const

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {fields.map((field) => {
        const error = state.fieldErrors?.[field.name]
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required
              className="mt-2"
              aria-invalid={Boolean(error)}
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>
        )
      })}

      <div>
        <Label htmlFor="status">状态</Label>
        <select
          id="status"
          name="status"
          defaultValue="New"
          className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-[#0071e3]/15"
        >
          <option value="New">新客户</option>
          <option value="Contacted">已联系</option>
          <option value="Qualified">已确认</option>
          <option value="Lost">已流失</option>
          <option value="Closed">已成交</option>
        </select>
      </div>

      {state.message && !state.success && (
        <p role="alert" className="rounded-xl bg-[#fff0f0] px-3 py-2 text-sm text-[#b42318]">
          {state.message}
        </p>
      )}

      <DialogFooter>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {pending ? "正在保存" : "创建客户"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function NewCustomerDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="self-start sm:self-auto" />}>
        <Plus aria-hidden="true" />
        新建客户
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>新建客户</DialogTitle>
          <DialogDescription>填写标准化客户信息，电话号码将执行强制查重。</DialogDescription>
        </DialogHeader>
        <CustomerForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
