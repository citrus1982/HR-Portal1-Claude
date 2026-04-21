import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { calculateProfileScore } from "@/lib/score"

const ProfileUpdateSchema = z.object({
  headline: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  target_role: z.string().max(100).optional(),
  sector: z.string().max(100).optional(),
  seniority_level: z.string().max(50).optional(),
  preferred_locations: z.array(z.string()).optional(),
  salary_min: z.number().int().min(0).optional(),
  salary_max: z.number().int().min(0).optional(),
  availability: z.string().optional(),
  work_authorization: z.string().optional(),
  languages: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const candidate = await prisma.candidate.findUnique({
    where: { user_id: session.user.id },
    include: { profile: true, experiences: { orderBy: { start_date: "desc" } }, educations: { orderBy: { start_date: "desc" } }, skills: { include: { skill: true } }, parsedFieldAudits: true },
  })
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const score = calculateProfileScore({ profile: candidate.profile, experiences: candidate.experiences, educations: candidate.educations, skills: candidate.skills })
  if (candidate.profile && candidate.profile.profile_score !== score) {
    await prisma.candidateProfile.update({ where: { candidate_id: candidate.id }, data: { profile_score: score } })
  }
  return NextResponse.json({ success: true, data: { ...candidate, profile_score: score } })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const candidate = await prisma.candidate.findUnique({ where: { user_id: session.user.id }, include: { experiences: true, educations: true, skills: true } })
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const updates = ProfileUpdateSchema.parse(await req.json())
  const updatedProfile = await prisma.candidateProfile.update({
    where: { candidate_id: candidate.id },
    data: {
      ...updates,
      preferred_locations: updates.preferred_locations ? JSON.stringify(updates.preferred_locations) : undefined,
      languages: updates.languages ? JSON.stringify(updates.languages) : undefined,
      onboarding_step: "done",
    },
  })
  const score = calculateProfileScore({ profile: updatedProfile, experiences: candidate.experiences, educations: candidate.educations, skills: candidate.skills })
  await prisma.candidateProfile.update({ where: { candidate_id: candidate.id }, data: { profile_score: score } })
  return NextResponse.json({ success: true, data: { ...updatedProfile, profile_score: score } })
}
