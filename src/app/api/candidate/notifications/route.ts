import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const notifications = await prisma.notification.findMany({ where: { user_id: session.user.id }, orderBy: { created_at: "desc" }, take: 30 })
  return NextResponse.json({ success: true, data: notifications })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { ids } = await req.json()
  await prisma.notification.updateMany({ where: { id: { in: ids }, user_id: session.user.id }, data: { read_at: new Date() } })
  return NextResponse.json({ success: true })
}
