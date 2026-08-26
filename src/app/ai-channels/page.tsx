import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Plus,
  Radio,
  Sparkles,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const automationRules = [
  {
    id: "status-contacted",
    name: "首次联系确认",
    trigger: "客户状态变为“已联系”",
    action: "自动发送“需求确认与下一步安排”话术",
    channel: "企业微信",
    status: "已启用",
    lastTriggered: "12 分钟前",
  },
  {
    id: "grade-a-follow-up",
    name: "A 类客户快速跟进",
    trigger: "AI 线索等级升级为 A 类",
    action: "向跟进人推送“30 分钟内回访”任务",
    channel: "站内任务",
    status: "已启用",
    lastTriggered: "1 小时前",
  },
  {
    id: "risk-high",
    name: "高风险客户挽回",
    trigger: "客户流失风险变为“高风险”",
    action: "发送挽回话术，并通知销售主管介入",
    channel: "短信 + 站内",
    status: "已启用",
    lastTriggered: "昨天 16:42",
  },
  {
    id: "meeting-complete",
    name: "到访后自动跟进",
    trigger: "客户状态变为“已到访”",
    action: "延迟 2 小时发送“到访感谢与方案回顾”",
    channel: "企业微信",
    status: "已启用",
    lastTriggered: "昨天 11:08",
  },
  {
    id: "inactive-three-days",
    name: "三天未跟进提醒",
    trigger: "A 类客户连续 3 天无新增沟通",
    action: "提醒跟进人，并准备释放公海审批",
    channel: "站内任务",
    status: "草稿",
    lastTriggered: "尚未触发",
  },
]

const overviewCards = [
  {
    label: "规则模板",
    value: automationRules.length,
    note: "覆盖客户状态与 AI 评级",
    icon: Workflow,
    tone: "blue",
  },
  {
    label: "启用中",
    value: automationRules.filter((rule) => rule.status === "已启用").length,
    note: "规则引擎接入后自动执行",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    label: "触达渠道",
    value: 4,
    note: "企微、短信、任务与站内信",
    icon: Radio,
    tone: "purple",
  },
]

const toneClasses = {
  blue: "bg-[#eff6ff] text-[#2563eb]",
  green: "bg-[#ecfdf3] text-[#15803d]",
  purple: "bg-[#f5f3ff] text-[#7c3aed]",
}

export default function AiChannelsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#2563eb] uppercase">
            <Workflow className="size-3.5" aria-hidden="true" />
            AI 渠道运营
          </div>
          <h2 className="apple-display text-5xl font-semibold leading-none text-[#1d1d1f] sm:text-6xl">
            自动化规则矩阵
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#6e6e73]">
            用统一的“触发条件 → 自动动作”规则，编排企业微信、短信与销售任务的客户触达节奏。
          </p>
        </div>
        <Button size="lg" disabled title="规则编辑器将在接入自动化引擎后开放">
          <Plus aria-hidden="true" />
          新建规则
        </Button>
      </section>

      <div className="grid gap-3 md:grid-cols-3" aria-label="自动化规则概览">
        {overviewCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-4 py-5">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                    toneClasses[item.tone as keyof typeof toneClasses]
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="apple-display text-3xl font-semibold tabular-nums text-[#1d1d1f]">
                      {item.value}
                    </span>
                    <span className="text-xs font-medium text-[#6e6e73]">{item.label}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#86868b]">{item.note}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-black/[0.055] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-[#2563eb]" aria-hidden="true" />
              <h3 className="font-semibold text-[#1d1d1f]">规则占位列表</h3>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#86868b]">
              当前展示标准规则模板；接入自动化执行引擎后可在此启停、编辑并查看运行日志。
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff7ed] px-3 py-1.5 text-xs font-semibold text-[#c2410c]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            模板预览
          </span>
        </div>

        <CardContent className="p-0">
          <Table className="min-w-[1080px] table-fixed">
            <TableHeader>
              <TableRow className="bg-[#f5f5f7]/80 hover:bg-[#f5f5f7]/80">
                <TableHead className="w-48 pl-5">规则名称</TableHead>
                <TableHead className="w-64">触发条件</TableHead>
                <TableHead className="w-80">自动动作</TableHead>
                <TableHead className="w-36">执行渠道</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-32 pr-5">最近触发</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automationRules.map((rule) => (
                <TableRow key={rule.id} className="align-top">
                  <TableCell className="py-4 pl-5 whitespace-normal">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
                        <MessageSquareText className="size-4" aria-hidden="true" />
                      </span>
                      <span className="font-semibold leading-6 text-[#1d1d1f]">{rule.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 whitespace-normal">
                    <div className="flex items-start gap-2 text-sm leading-6 text-[#424245]">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      {rule.trigger}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 whitespace-normal">
                    <div className="flex items-start gap-2 text-sm leading-6 text-[#424245]">
                      <ArrowRight className="mt-1 size-4 shrink-0 text-[#86868b]" aria-hidden="true" />
                      {rule.action}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-[#424245]">{rule.channel}</TableCell>
                  <TableCell className="py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        rule.status === "已启用"
                          ? "bg-[#ecfdf3] text-[#15803d]"
                          : "bg-[#f5f5f7] text-[#6e6e73]"
                      )}
                    >
                      {rule.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-5 text-xs text-[#86868b]">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      {rule.lastTriggered}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
