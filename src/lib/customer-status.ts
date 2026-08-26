export const customerStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Lost",
  "Closed",
] as const

export type CustomerStatus = (typeof customerStatuses)[number]

export const customerStatusLabels: Record<string, string> = {
  New: "新客户",
  Contacted: "已联系",
  Qualified: "已确认",
  Lost: "已流失",
  Closed: "已成交",
}

export const customerStatusStyles: Record<string, string> = {
  New: "bg-[#eaf4ff] text-[#0066cc] ring-[#0071e3]/10",
  Contacted: "bg-[#fff8e8] text-[#9a5b00] ring-[#ff9f0a]/10",
  Qualified: "bg-[#f5efff] text-[#753bbd] ring-[#af52de]/10",
  Lost: "bg-[#f0f0f2] text-[#6e6e73] ring-black/[0.055]",
  Closed: "bg-[#edf9f0] text-[#248a3d] ring-[#34c759]/10",
}
