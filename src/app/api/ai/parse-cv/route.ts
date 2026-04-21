import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseCV } from "@/lib/claude"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { text } = await req.json()
  if (!text || typeof text !== "string" || text.trim().length < 50) return NextResponse.json({ error: "Text too short to parse" }, { status: 400 })
  const candidate = await prisma.candidate.findUnique({ where: { user_id: session.user.id } })
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const parsed = await parseCV(text)
  return NextResponse.json({ success: true, data: parsed })
}
