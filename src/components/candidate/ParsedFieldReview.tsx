"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Edit2, Loader2 } from "lucide-react"

interface ParsedFieldAuditRecord {
  field_name: string
  parsed_value: string | null
  confirmed_value: string | null
  confidence_score: number | null
  is_confirmed: boolean
}

interface ExperienceRecord {
  id: string
  company: string
  title: string
  start_date: Date | null
  end_date: Date | null
  is_current: boolean
  description: string | null
}

interface EducationRecord {
  id: string
  institution: string
  qualification: string | null
  field_of_study: string | null
}

interface SkillRecord {
  id: string
  name: string
  proficiency: string | null
}

interface Props {
  audits: ParsedFieldAuditRecord[]
  experiences: ExperienceRecord[]
  educations: EducationRecord[]
  skills: SkillRecord[]
}

const FIELD_LABELS: Record<string, { label: string; multiline?: boolean }> = {
  name: { label: "Full name" },
  email: { label: "Email address" },
  phone: { label: "Phone number" },
  headline: { label: "Professional headline" },
  target_role: { label: "Target role" },
  sector: { label: "Industry sector" },
  seniority_level: { label: "Seniority level" },
  summary: { label: "Professional summary", multiline: true },
}

function confidenceBadge(score: number | null) {
  if (score === null) return null
  if (score >= 0.85) return <Badge variant="success" className="text-xs">High confidence</Badge>
  if (score >= 0.6) return <Badge variant="warning" className="text-xs">Check this</Badge>
  return <Badge variant="destructive" className="text-xs">Low confidence</Badge>
}

export default function ParsedFieldReview({ audits, experiences, educations, skills }: Props) {
  const router = useRouter()
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const a of audits) {
      initial[a.field_name] = a.confirmed_value ?? a.parsed_value ?? ""
    }
    return initial
  })
  const [editingField, setEditingField] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/candidate/confirm-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j.error || "Failed to save")
        return
      }
      router.push("/candidate/onboarding/complete")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We've extracted {audits.length} fields from your CV. Check each one — edit anything that doesn't look right.
      </p>

      {audits.map((audit) => {
        const meta = FIELD_LABELS[audit.field_name]
        if (!meta) return null
        const value = fields[audit.field_name] ?? ""
        const isEditing = editingField === audit.field_name

        return (
          <Card key={audit.field_name}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{meta.label}</span>
                  {confidenceBadge(audit.confidence_score)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingField(isEditing ? null : audit.field_name)}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  {meta.multiline ? (
                    <Textarea
                      value={value}
                      onChange={(e) => setFields((p) => ({ ...p, [audit.field_name]: e.target.value }))}
                      rows={4}
                      autoFocus
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={(e) => setFields((p) => ({ ...p, [audit.field_name]: e.target.value }))}
                      autoFocus
                    />
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                    Done
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground break-words">
                  {value || <span className="italic">Not found</span>}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Experience summary */}
      {experiences.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium mb-2">Work experience ({experiences.length} entries)</p>
            <div className="space-y-1.5">
              {experiences.map((exp) => (
                <div key={exp.id} className="text-sm text-muted-foreground">
                  {exp.title} at {exp.company}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education summary */}
      {educations.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium mb-2">Education ({educations.length} entries)</p>
            <div className="space-y-1.5">
              {educations.map((edu) => (
                <div key={edu.id} className="text-sm text-muted-foreground">
                  {edu.qualification ?? "Qualification"} — {edu.institution}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills summary */}
      {skills.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium mb-2">Skills extracted ({skills.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <Badge key={s.id} variant="secondary">{s.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleConfirm} disabled={submitting} size="lg" className="w-full">
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : (
          <><CheckCircle2 className="h-4 w-4" /> Confirm and continue</>
        )}
      </Button>
    </div>
  )
}
