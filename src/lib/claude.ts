import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface ParsedCVExperience {
  company: string
  title: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
  industry: string | null
}

export interface ParsedCVEducation {
  institution: string
  qualification: string | null
  field_of_study: string | null
  start_date: string | null
  end_date: string | null
}

export interface ParsedCVSkill {
  name: string
  proficiency: "beginner" | "intermediate" | "expert" | null
  years_used: number | null
}

export interface ParsedCV {
  name: string | null
  email: string | null
  phone: string | null
  headline: string | null
  summary: string | null
  target_role: string | null
  sector: string | null
  seniority_level: string | null
  languages: string[]
  experiences: ParsedCVExperience[]
  educations: ParsedCVEducation[]
  skills: ParsedCVSkill[]
  confidence_scores: Record<string, number>
}

const CV_PARSE_SYSTEM = `You are an expert CV parser for a Malaysian hiring platform.
Extract structured data from resume/CV text.
Rules:
1. Only extract information explicitly stated in the text — never invent or infer data
2. Dates in YYYY-MM format (e.g. 2022-03). Use null if unclear
3. seniority_level: one of entry/junior/mid/senior/lead/manager/director/executive
4. proficiency: one of beginner/intermediate/expert (infer from years/titles if not stated)
5. confidence_scores: 0.0-1.0 per top-level field (1.0 = clearly stated, 0.5 = inferred)
6. Return valid JSON only — no markdown, no explanation`

export async function parseCV(text: string): Promise<ParsedCV> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: CV_PARSE_SYSTEM,
    messages: [{
      role: "user",
      content: `Parse this CV and return a JSON object matching exactly this TypeScript interface:
{
  name: string | null, email: string | null, phone: string | null,
  headline: string | null, summary: string | null, target_role: string | null,
  sector: string | null, seniority_level: string | null, languages: string[],
  experiences: Array<{ company: string, title: string, start_date: string | null,
    end_date: string | null, is_current: boolean, description: string | null, industry: string | null }>,
  educations: Array<{ institution: string, qualification: string | null,
    field_of_study: string | null, start_date: string | null, end_date: string | null }>,
  skills: Array<{ name: string, proficiency: "beginner"|"intermediate"|"expert"|null, years_used: number|null }>,
  confidence_scores: Record<string, number>
}

CV TEXT:
${text.slice(0, 12000)}`,
    }],
  })
  const content = response.content[0]
  if (content.type !== "text") throw new Error("Unexpected Claude response type")
  const raw = content.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "")
  return JSON.parse(raw) as ParsedCV
}

export interface ResumeGenerationInput {
  candidateProfile: Record<string, unknown>
  experiences: ParsedCVExperience[]
  educations: ParsedCVEducation[]
  skills: { name: string; proficiency: string | null }[]
  targetRole: string
}

const RESUME_SYSTEM = `You are a professional resume writer for Malaysian job seekers.
Generate an ATS-optimized resume from the provided structured profile data.
Rules:
1. ONLY use data provided — never add skills, achievements, or dates not in the input
2. Tailor language and emphasis toward the target role
3. Use active verbs and quantify achievements where data exists
4. Keep it to 1 page equivalent of content
5. Return JSON only`

export async function buildResumeContent(input: ResumeGenerationInput): Promise<{
  summary: string
  experience_bullets: Array<{ role_id: string; bullets: string[] }>
  skills_section: string[]
  education_lines: string[]
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: RESUME_SYSTEM,
    messages: [{
      role: "user",
      content: `Generate resume content for this candidate targeting: "${input.targetRole}"

Profile data:
${JSON.stringify(input, null, 2)}

Return JSON: { "summary": "...", "experience_bullets": [{"role_id": "...", "bullets": [...]}], "skills_section": [...], "education_lines": [...] }`,
    }],
  })
  const content = response.content[0]
  if (content.type !== "text") throw new Error("Unexpected Claude response type")
  const raw = content.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "")
  return JSON.parse(raw)
}
