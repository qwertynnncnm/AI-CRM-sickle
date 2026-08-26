import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-lg py-12 text-center">
      <CardContent>
        <p className="text-sm font-medium text-[#0066cc]">页面不存在</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
          没有找到该客户
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
          客户可能已被删除，或者当前链接中的客户编号不正确。
        </p>
        <Button className="mt-6" render={<Link href="/customers" />}>
          <ArrowLeft aria-hidden="true" />
          返回客户列表
        </Button>
      </CardContent>
    </Card>
  )
}
