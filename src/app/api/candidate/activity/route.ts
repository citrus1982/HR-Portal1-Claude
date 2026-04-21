import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const candidate = await prisma.candidate.findUnique({ where: { user_id: session.user.id } })
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const [unlocks, stages, contacts] = await Promise.all([
    prisma.candidateUnlock.findMany({ where: { candidate_id: candidate.id }, include: { employer: { select: { company_name: true, industry: true } } }, orderBy: { unlocked_at: "desc" }, take: 20 }),
    prisma.hiringStage.findMany({ where: { candidate_id: candidate.id }, include: { employer: { select: { company_name: true } } }, orderBy: { updated_at: "desc" }, take: 20 }),
    prisma.candidateContact.findMany({ where: { candidate_id: candidate.id }, include: { employer: { select: { company_name: true } } }, orderBy: { first_contact_at: "desc" }, take: 20 }),
  ])
  return NextResponse.json({ success: true, data: { unlocks, stages, contacts } })
}
