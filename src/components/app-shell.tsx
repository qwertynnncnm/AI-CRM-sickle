"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  Bell,
  BookOpenCheck,
  BrainCircuit,
  ChevronDown,
  Contact,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquareQuote,
  Search,
  Settings2,
  Sparkles,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    label: "业务主台",
    items: [
      { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
      { href: "/leads", label: "线索池", icon: UsersRound },
      { href: "/customers", label: "客户库", icon: Contact },
    ],
  },
  {
    label: "AI 洞察中心",
    items: [{ href: "/ai-insights", label: "团队效能与战报", icon: BrainCircuit }],
  },
  {
    label: "AI 营销与获客",
    items: [{ href: "/ai-marketing", label: "文案与落地页生成", icon: Megaphone }],
  },
  {
    label: "AI 销售引擎",
    items: [{ href: "/ai-sales", label: "实时指导与话术生成", icon: MessageSquareQuote }],
  },
  {
    label: "AI 渠道运营",
    items: [{ href: "/ai-channels", label: "多渠道自动化策略", icon: Workflow }],
  },
  {
    label: "企业知识大脑",
    items: [{ href: "/knowledge-base", label: "实战问答库", icon: BookOpenCheck }],
  },
  {
    label: "系统支撑",
    items: [{ href: "/settings", label: "系统与大模型设置", icon: Settings2 }],
  },
]

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/20"
      aria-label="前往 CRM 仪表盘"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#1d4ed8] text-white shadow-[0_5px_16px_rgba(29,78,216,0.24)]">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-[-0.01em] text-[#111827]">
          星联销售中台
        </span>
        <span className="block truncate text-[0.68rem] text-[#6b7280]">企业智能营收系统</span>
      </span>
    </Link>
  )
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-4" aria-label="主导航">
      {navigationGroups.map((group) => (
        <section key={group.label} aria-labelledby={`nav-${group.label}`}>
          <h2
            id={`nav-${group.label}`}
            className="mb-1.5 px-2.5 text-[0.62rem] font-semibold tracking-[0.12em] text-[#9ca3af] uppercase"
          >
            {group.label}
          </h2>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isItemActive(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.8rem] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-[#2563eb]/20",
                    active
                      ? "bg-[#e8efff] font-semibold text-[#1d4ed8]"
                      : "font-medium text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]"
                  )}
                >
                  {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#2563eb]" />}
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-[#2563eb]" : "text-[#9ca3af] group-hover:text-[#4b5563]"
                    )}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </nav>
  )
}

function SidebarFooter() {
  return (
    <div className="border-t border-black/[0.06] pt-3">
      <button className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-[#f3f4f6]">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#111827] text-[0.65rem] font-semibold text-white">
          OL
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-[#111827]">销售管理员</span>
          <span className="block truncate text-[0.65rem] text-[#9ca3af]">企业工作区</span>
        </span>
        <ChevronDown className="size-3.5 text-[#9ca3af]" aria-hidden="true" />
      </button>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col border-r border-black/[0.065] bg-[#fbfcfe]/95 px-3 py-4 backdrop-blur-xl">
      <div className="px-2"><Brand /></div>
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-0.5 pb-4 [scrollbar-width:thin]">
        <Navigation onNavigate={onNavigate} />
      </div>
      <SidebarFooter />
    </div>
  )
}

function getCurrentPage(pathname: string) {
  if (/^\/customers\/[^/]+$/.test(pathname)) {
    return { label: "客户详情", group: "业务主台" }
  }
  for (const group of navigationGroups) {
    const item = group.items.find((candidate) => isItemActive(pathname, candidate.href))
    if (item) return { label: item.label, group: group.label }
  }
  return { label: "仪表盘", group: "业务主台" }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const currentPage = getCurrentPage(pathname)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#111827]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/88 backdrop-blur-xl">
          <div className="flex h-15 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <DialogTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="打开导航" />}>
                <Menu aria-hidden="true" />
              </DialogTrigger>
              <DialogContent className="top-0 left-0 h-dvh w-[min(18rem,90vw)] max-w-none translate-x-0 translate-y-0 rounded-none p-0 ring-0 sm:max-w-none">
                <DialogTitle className="sr-only">导航菜单</DialogTitle>
                <DialogDescription className="sr-only">在销售中台各功能区之间切换。</DialogDescription>
                <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
              </DialogContent>
            </Dialog>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.62rem] font-semibold tracking-[0.1em] text-[#9ca3af] uppercase">
                {currentPage.group}
              </p>
              <h1 className="truncate text-sm font-semibold text-[#111827]">{currentPage.label}</h1>
            </div>

            <label className="relative hidden w-full max-w-xs md:block">
              <span className="sr-only">全局搜索</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca3af]" aria-hidden="true" />
              <input
                type="search"
                placeholder="搜索客户、公司或知识……"
                className="h-8 w-full rounded-lg border border-black/[0.07] bg-[#f3f4f6] pl-8 pr-3 text-xs outline-none transition focus:border-[#2563eb]/30 focus:bg-white focus:ring-3 focus:ring-[#2563eb]/10"
              />
            </label>
            <Button variant="ghost" size="icon" className="relative text-[#6b7280]" aria-label="通知">
              <Bell aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#ef4444]" />
            </Button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.75rem)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
