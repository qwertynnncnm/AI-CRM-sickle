"use client"

import { useActionState, useEffect, useRef } from "react"
import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Save,
  Server,
  Sparkles,
} from "lucide-react"

import {
  saveAiSettings,
  type AiSettingsFormState,
} from "@/app/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AiSettingsFormState = {
  success: false,
  message: "",
}

type AiSettingsFormProps = {
  maskedKey: string | null
  baseUrl: string
  modelName: string
}

export function AiSettingsForm({
  maskedKey,
  baseUrl,
  modelName,
}: AiSettingsFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(
    saveAiSettings,
    initialState
  )

  useEffect(() => {
    if (state.success && state.savedAt) {
      formRef.current?.reset()
    }
  }, [state.savedAt, state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {maskedKey && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#34c759]/15 bg-[#edf9f0] px-4 py-3">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-[#248a3d]"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1d6b32]">已配置 API Key</p>
            <p className="mt-1 break-all font-mono text-xs text-[#248a3d]">
              {maskedKey}
            </p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="api-key">
          <KeyRound className="size-4 text-[#86868b]" aria-hidden="true" />
          API Key
        </Label>
        <Input
          id="api-key"
          name="apiKey"
          type="password"
          maxLength={512}
          autoComplete="new-password"
          spellCheck={false}
          placeholder={maskedKey ?? "请输入服务商提供的 API Key"}
          aria-invalid={Boolean(state.fieldErrors?.apiKey)}
          aria-describedby={
            state.fieldErrors?.apiKey ? "api-key-error" : "api-key-help"
          }
          className="mt-2 h-10 font-mono"
        />
        <p id="api-key-help" className="mt-2 text-xs leading-5 text-[#6e6e73]">
          {maskedKey
            ? "留空会保留当前密钥；输入新密钥则会覆盖。完整密钥不会返回浏览器。"
            : "支持 DeepSeek、通义千问、OpenAI 等服务商的密钥格式。"}
        </p>
        {state.fieldErrors?.apiKey && (
          <p id="api-key-error" className="mt-1.5 text-xs text-red-600">
            {state.fieldErrors.apiKey}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="base-url">
          <Server className="size-4 text-[#86868b]" aria-hidden="true" />
          Base URL
        </Label>
        <Input
          id="base-url"
          name="baseUrl"
          type="url"
          maxLength={2048}
          defaultValue={baseUrl}
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          placeholder="https://api.deepseek.com/v1"
          aria-invalid={Boolean(state.fieldErrors?.baseUrl)}
          aria-describedby={
            state.fieldErrors?.baseUrl ? "base-url-error" : "base-url-help"
          }
          className="mt-2 h-10 font-mono"
        />
        <p id="base-url-help" className="mt-2 text-xs leading-5 text-[#6e6e73]">
          填写兼容接口的基础地址；使用服务商默认地址时可以留空。
        </p>
        {state.fieldErrors?.baseUrl && (
          <p id="base-url-error" className="mt-1.5 text-xs text-red-600">
            {state.fieldErrors.baseUrl}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="model-name">
          <Sparkles className="size-4 text-[#86868b]" aria-hidden="true" />
          模型名称
        </Label>
        <Input
          id="model-name"
          name="modelName"
          type="text"
          maxLength={200}
          defaultValue={modelName}
          autoComplete="off"
          spellCheck={false}
          placeholder="deepseek-chat 或 gpt-4o-mini"
          aria-invalid={Boolean(state.fieldErrors?.modelName)}
          aria-describedby={
            state.fieldErrors?.modelName
              ? "model-name-error"
              : "model-name-help"
          }
          className="mt-2 h-10 font-mono"
        />
        <p id="model-name-help" className="mt-2 text-xs leading-5 text-[#6e6e73]">
          请填写服务商接口所接受的准确模型标识。
        </p>
        {state.fieldErrors?.modelName && (
          <p id="model-name-error" className="mt-1.5 text-xs text-red-600">
            {state.fieldErrors.modelName}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-black/[0.055] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">
          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              className={
                state.success ? "text-sm text-emerald-700" : "text-sm text-red-700"
              }
            >
              {state.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" disabled={pending} className="sm:self-end">
          {pending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              正在保存
            </>
          ) : (
            <>
              <Save aria-hidden="true" />
              保存配置
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
