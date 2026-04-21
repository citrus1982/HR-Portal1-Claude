import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToR2, buildR2Key } from "@/lib/r2"
import { parseCV } from "@/lib/claude"
import { createHash } from "crypto"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default
    const data = await pdfParse(buffer)
    return data.text
  }
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const candidate = await prisma.candidate.findUnique({
    where: { user_id: session.user.id },
  })
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF and Word documents are accepted" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const textHash = createHash("sha256").update(buffer).digest("hex")

  // Upload to R2
  const key = buildR2Key("resumes", candidate.id, file.name)
  const fileUrl = await uploadToR2(key, buffer, file.type)

  await prisma.resumeFile.create({
    data: {
      candidate_id: candidate.id,
      file_url: fileUrl,
      original_name: file.name,
      mime_type: file.type,
      source_type: "upload",
      parsed_text_hash: textHash,
      parse_status: "processing",
    },
  })

  // Extract text and parse with Claude
  let extractedText: string
  try {
    extractedText = await extractText(buffer, file.type)
  } catch (err) {
    console.error("Text extraction failed:", err)
    return NextResponse.json({ error: "Could not read file content" }, { status: 422 })
  }

  if (extractedText.trim().length < 50) {
    return NextResponse.json({ error: "File appears to be empty or image-based" }, { status: 422 })
  }

  let parsed
  try {
    parsed = await parseCV(extractedText)
  } catch (err) {
    console.error("Claude parsing failed:", err)
    return NextResponse.json({ error: "CV parsing failed, please try again" }, { status: 500 })
  }

  // Write ParsedFieldAudit records
  const topLevelFields: Record<string, unknown> = {
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    headline: parsed.headline,
    summary: parsed.summary,
    target_role: parsed.target_role,
    sector: parsed.sector,
    seniority_level: parsed.seniority_level,
  }

  await prisma.$transaction(
    Object.entries(topLevelFields).map(([field_name, value]) =>
      prisma.parsedFieldAudit.upsert({
        where: { candidate_id_field_name: { candidate_id: candidate.id, field_name } },
        create: {
          candidate_id: candidate.id,
          field_name,
          parsed_value: value != null ? String(value) : null,
          confidence_score: parsed.confidence_scores?.[field_name] ?? null,
          is_confirmed: false,
        },
        update: {
          parsed_value: value != null ? String(value) : null,
          confidence_score: parsed.confidence_scores?.[field_name] ?? null,
          is_confirmed: false,
        },
      })
    )
  )

  // Store experiences, educations, skills in profile
  await prisma.$transaction([
    prisma.experience.deleteMany({ where: { candidate_id: candidate.id } }),
    prisma.education.deleteMany({ where: { candidate_id: candidate.id } }),
  ])

  if (parsed.experiences.length > 0) {
    await prisma.experience.createMany({
      data: parsed.experiences.map((e) => ({
        candidate_id: candidate.id,
        company: e.company,
        title: e.title,
        start_date: e.start_date ? new Date(e.start_date + "-01") : null,
        end_date: e.end_date ? new Date(e.end_date + "-01") : null,
        is_current: e.is_current,
        description: e.description,
        industry: e.industry,
      })),
    })
  }

  if (parsed.educations.length > 0) {
    await prisma.education.createMany({
      data: parsed.educations.map((e) => ({
        candidate_id: candidate.id,
        institution: e.institution,
        qualification: e.qualification,
        field_of_study: e.field_of_study,
        start_date: e.start_date ? new Date(e.start_date + "-01") : null,
        end_date: e.end_date ? new Date(e.end_date + "-01") : null,
      })),
    })
  }

  // Upsert skills
  for (const s of parsed.skills) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      create: { name: s.name },
      update: {},
    })
    await prisma.candidateSkill.upsert({
      where: { candidate_id_skill_id: { candidate_id: candidate.id, skill_id: skill.id } },
      create: {
        candidate_id: candidate.id,
        skill_id: skill.id,
        proficiency: s.proficiency,
        years_used: s.years_used,
        source: "parsed",
      },
      update: {
        proficiency: s.proficiency,
        years_used: s.years_used,
        source: "parsed",
      },
    })
  }

  // Update onboarding step
  await prisma.candidateProfile.update({
    where: { candidate_id: candidate.id },
    data: { onboarding_step: "review" },
  })

  return NextResponse.json({ success: true, parsed_fields: Object.keys(topLevelFields).length })
}
