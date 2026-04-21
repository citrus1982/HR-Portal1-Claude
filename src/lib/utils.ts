import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "Present"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-MY", { month: "short", year: "numeric" })
}

export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Negotiable"
  const fmt = (n: number) => new Intl.NumberFormat("en-MY", { notation: "compact", maximumFractionDigits: 0 }).format(n)
  if (min && max) return `RM ${fmt(min)} – ${fmt(max)}`
  if (min) return `RM ${fmt(min)}+`
  return `Up to RM ${fmt(max!)}`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export function truncate(text: string, length = 120): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + "…"
}

export const MALAYSIAN_STATES = [
  "Kuala Lumpur", "Selangor", "Johor", "Penang", "Perak", "Sabah", "Sarawak",
  "Negeri Sembilan", "Melaka", "Kedah", "Kelantan", "Terengganu", "Pahang", "Perlis",
  "Putrajaya", "Labuan",
]

export const SECTORS = [
  "Accounting & Finance", "Admin & Office", "Construction", "Customer Service",
  "Education", "Engineering", "F&B / Hospitality", "Healthcare", "Human Resources",
  "IT & Technology", "Legal", "Logistics & Supply Chain", "Manufacturing",
  "Marketing & Media", "Retail & Sales", "Security", "Transportation", "Other",
]

export const AVAILABILITY_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "2_months", label: "2+ months" },
]

export const WORK_AUTH_OPTIONS = [
  { value: "citizen", label: "Malaysian Citizen" },
  { value: "pr", label: "Permanent Resident (PR)" },
  { value: "visa_holder", label: "Visa Holder" },
  { value: "expatriate", label: "Expatriate" },
]

export const SENIORITY_LEVELS = [
  "Entry Level", "Junior", "Mid Level", "Senior", "Lead",
  "Manager", "Director", "Executive / C-Suite",
]

export const LANGUAGES = [
  "Bahasa Malaysia", "English", "Mandarin", "Cantonese",
  "Tamil", "Iban", "Kadazan", "Other",
]
