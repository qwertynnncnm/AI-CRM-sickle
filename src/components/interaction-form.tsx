"use client"

import { useActionState, useEffect, useRef } from "react"
import { LoaderCircle, Send } from "lucide-react"

import {
  createInteraction,
  type InteractionFormState,
} from "@/app/customers/[id]/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialState: InteractionFormState = { success: false, message: "" }

export function InteractionForm({ customerId }: { customerId: number }) {
  const formRef = useRef<HTMLFormElement>(null)
  const action = createInteraction.bind(null, customerId)
  const [state, formAction, pending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success, state.createdId])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="raw-content">新增沟通原文</Label>
        <Textarea
          id="raw-content"
          name="rawContent"
          required
          maxLength={100000}
          placeholder="粘贴录音转写、聊天记录或手工沟通纪要……"
          className="mt-2 min-h-28 resize-y"
          aria-invalid={Boolean(state.fieldErrors?.rawContent)}
        />
        {state.fieldErrors?.rawContent && (
          <p className="mt-1.5 text-xs text-red-600">{state.fieldErrors.rawContent}</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className={state.success ? "text-xs text-emerald-700" : "text-xs text-red-700"}>
          {state.message}
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          {pending ? "正在保存" : "添加记录"}
        </Button>
      </div>
    </form>
  )
}
