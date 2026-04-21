interface ScoreInput {
  profile: {
    headline?: string | null
    summary?: string | null
    target_role?: string | null
    sector?: string | null
    preferred_locations?: unknown
    salary_min?: number | null
    salary_max?: number | null
    availability?: string | null
    work_authorization?: string | null
    languages?: unknown
  } | null
  experiences: { company?: string; title?: string }[]
  educations: { institution?: string }[]
  skills: { skill_id?: string; name?: string }[]
}

export function calculateProfileScore(input: ScoreInput): number {
  const { profile, experiences, educations, skills } = input
  let score = 0
  if (profile?.headline) score += 10
  if (profile?.summary) score += 10
  const validExp = experiences.filter((e) => e.company && e.title)
  if (validExp.length >= 1) score += 20
  if (educations.length >= 1) score += 15
  if (skills.length >= 3) score += 15
  if (profile?.availability && profile?.salary_min && profile?.salary_max) score += 15
  if (profile?.target_role && profile?.sector) score += 10
  const langs = parseJsonArray(profile?.languages)
  if (langs.length >= 1) score += 5
  return Math.min(score, 100)
}

function parseJsonArray(val: unknown): unknown[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    const parsed = JSON.parse(val as string)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Strong", color: "text-green-600" }
  if (score >= 60) return { label: "Good", color: "text-blue-600" }
  if (score >= 40) return { label: "Fair", color: "text-amber-600" }
  return { label: "Incomplete", color: "text-red-500" }
}

export function scoreNudges(input: ScoreInput): string[] {
  const { profile, experiences, educations, skills } = input
  const nudges: string[] = []
  if (!profile?.headline) nudges.push("Add a professional headline")
  if (!profile?.summary) nudges.push("Write a short summary about yourself")
  if (experiences.filter((e) => e.company && e.title).length === 0) nudges.push("Add at least one work experience")
  if (educations.length === 0) nudges.push("Add your education")
  if (skills.length < 3) nudges.push(`Add ${3 - skills.length} more skill(s)`)
  if (!profile?.availability) nudges.push("Set your availability")
  if (!profile?.salary_min || !profile?.salary_max) nudges.push("Set your salary range")
  if (!profile?.target_role || !profile?.sector) nudges.push("Set your target role and sector")
  return nudges.slice(0, 3)
}
