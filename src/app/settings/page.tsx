import { Bot, ShieldCheck } from "lucide-react"

import { AiSettingsForm } from "@/components/ai-settings-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

function maskApiKey(apiKey: string) {
  const suffix = apiKey.length > 4 ? apiKey.slice(-4) : ""
  const prefix = apiKey.startsWith("sk-") ? "sk-" : ""
  return `${prefix}********${suffix}`
}

export default async function SettingsPage() {
  const setting = await prisma.systemSetting.findUnique({
    where: { id: 1 },
    select: { apiKey: true, baseUrl: true, modelName: true },
  })

  return (
    <div className="space-y-6">
      <section>
        <h2 className="apple-display text-5xl font-semibold leading-none text-[#1d1d1f] sm:text-6xl">
          设置
        </h2>
        <p className="mt-4 text-base text-[#6e6e73]">
          配置 CRM 使用的大模型标准兼容接口。
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Card>
          <CardHeader className="border-b border-black/[0.055] pb-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#eaf4ff] text-[#0071e3]">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>大模型 API 配置</CardTitle>
                <CardDescription className="mt-1.5">
                  兼容 DeepSeek、通义千问、OpenAI 等标准接口。
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AiSettingsForm
              maskedKey={setting?.apiKey ? maskApiKey(setting.apiKey) : null}
              baseUrl={setting?.baseUrl ?? ""}
              modelName={setting?.modelName ?? ""}
            />
          </CardContent>
        </Card>

        <Card className="h-fit bg-[#1d1d1f] text-white ring-0">
          <CardHeader>
            <ShieldCheck className="size-5 text-[#64d2ff]" aria-hidden="true" />
            <CardTitle className="text-white">密钥保护</CardTitle>
            <CardDescription className="leading-6 text-[#d2d2d7]">
              完整密钥只在服务端保存和读取，浏览器仅接收脱敏摘要。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
