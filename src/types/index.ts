export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN"
export type CandidateStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED"
export type VisibilityStatus = "ACTIVE" | "PAUSED" | "HIDDEN"
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED"
export type HiringStageValue = "shortlisted" | "interview" | "offer" | "hired" | "rejected"

export interface CandidateProfileData {
  headline: string | null
  summary: string | null
  target_role: string | null
  sector: string | null
  seniority_level: string | null
  preferred_locations: string[]
  salary_min: number | null
  salary_max: number | null
  availability: string | null
  work_authorization: string | null
  languages: string[]
  profile_score: number
  onboarding_step: string
}

export interface ExperienceData {
  id?: string
  company: string
  title: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
  industry: string | null
}

export interface EducationData {
  id?: string
  institution: string
  qualification: string | null
  field_of_study: string | null
  start_date: string | null
  end_date: string | null
}

export interface SkillData {
  id?: string
  skill_id?: string
  name: string
  proficiency: string | null
  years_used: number | null
  source?: string
}

export interface ParsedFieldAuditData {
  field_name: string
  parsed_value: string | null
  confirmed_value: string | null
  confidence_score: number | null
  is_confirmed: boolean
}

export interface AnonymizedCandidate {
  id: string
  headline: string | null
  sector: string | null
  seniority_level: string | null
  preferred_locations: string[]
  salary_min: number | null
  salary_max: number | null
  availability: string | null
  languages: string[]
  profile_score: number
  skills: string[]
  is_unlocked: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
