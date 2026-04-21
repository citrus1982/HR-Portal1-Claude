import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const ConfirmSchema = z.object({ fields: z.record(z.string(), z.string().nullable()) })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const candidate = await prisma.candidate.findUnique({ where: { user_id: session.user.id } })
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { fields } = ConfirmSchema.parse(await req.json())

  await prisma.$transaction(
    Object.entries(fields).map(([field_name, confirmed_value]) =>
      prisma.parsedFieldAudit.upsert({
        where: { candidate_id_field_name: { candidate_id: candidate.id, field_name } },
        create: { candidate_id: candidate.id, field_name, parsed_value: confirmed_value, confirmed_value, is_confirmed: true, updated_by: session.user.id },
        update: { confirmed_value, is_confirmed: true, updated_by: session.user.id },
      })
    )
  )

  const confirmed = Object.entries(fields)
  const nameField = confirmed.find(([k]) => k === "name")?.[1]
  if (nameField) await prisma.candidate.update({ where: { id: candidate.id }, data: { name: nameField } })

  const profileUpdates: Record<string, string | null> = {}
  for (const key of ["headline", "summary", "target_role", "sector", "seniority_level"]) {
    const val = confirmed.find(([k]) => k === key)?.[1]
    if (val !== undefined) profileUpdates[key] = val
  }
  if (Object.keys(profileUpdates).length > 0) {
    await prisma.candidateProfile.update({ where: { candidate_id: candidate.id }, data: { ...profileUpdates, onboarding_step: "complete" } })
  }
  return NextResponse.json({ success: true })
}
