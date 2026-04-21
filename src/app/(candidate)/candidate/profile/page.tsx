import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateProfileScore, scoreLabel, scoreNudges } from "@/lib/score"
import ProfileScoreBar from "@/components/candidate/ProfileScoreBar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatSalary } from "@/lib/utils"
import Link from "next/link"
import { Pencil, MapPin, DollarSign, Clock, Globe, Eye, EyeOff } from "lucide-react"

export const metadata = { title: "My Profile" }

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const candidate = await prisma.candidate.findUnique({
    where: { user_id: session.user.id },
    include: {
      profile: true,
      experiences: { orderBy: { start_date: "desc" } },
      educations: { orderBy: { start_date: "desc" } },
      skills: { include: { skill: true } },
    },
  })

  if (!candidate) redirect("/auth/login")

  if (!candidate.profile || candidate.profile.onboarding_step === "upload") {
    redirect("/candidate/onboarding/upload")
  }
  if (candidate.profile.onboarding_step === "review") {
    redirect("/candidate/onboarding/review")
  }
  if (candidate.profile.onboarding_step === "complete") {
    redirect("/candidate/onboarding/complete")
  }

  const score = calculateProfileScore({
    profile: candidate.profile,
    experiences: candidate.experiences,
    educations: candidate.educations,
    skills: candidate.skills,
  })
  const nudges = scoreNudges({
    profile: candidate.profile,
    experiences: candidate.experiences,
    educations: candidate.educations,
    skills: candidate.skills,
  })
  const { label: scoreText, color: scoreColor } = scoreLabel(score)
  const locations = (candidate.profile.preferred_locations as string[] | null) ?? []
  const languages = (candidate.profile.languages as string[] | null) ?? []

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          {candidate.profile.headline && (
            <p className="text-muted-foreground mt-0.5">{candidate.profile.headline}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={candidate.visibility_status === "ACTIVE" ? "success" : "outline"}>
              {candidate.visibility_status === "ACTIVE" ? (
                <><Eye className="h-3 w-3 mr-1" />Visible to employers</>
              ) : (
                <><EyeOff className="h-3 w-3 mr-1" />Hidden</>
              )}
            </Badge>
          </div>
        </div>
        <Link href="/candidate/onboarding/complete">
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>

      {/* Score card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Profile strength</span>
            <span className={`font-bold ${scoreColor}`}>{score}/100 — {scoreText}</span>
          </div>
          <ProfileScoreBar score={score} />
          {nudges.length > 0 && (
            <ul className="mt-3 space-y-1">
              {nudges.map((n) => (
                <li key={n} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Employability details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {candidate.profile.target_role && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Target role</p>
              <p className="font-medium mt-0.5">{candidate.profile.target_role}</p>
            </div>
          )}
          {candidate.profile.sector && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Sector</p>
              <p className="font-medium mt-0.5">{candidate.profile.sector}</p>
            </div>
          )}
          {(candidate.profile.salary_min || candidate.profile.salary_max) && (
            <div className="flex items-start gap-1.5">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Salary expectation</p>
                <p className="font-medium mt-0.5">{formatSalary(candidate.profile.salary_min, candidate.profile.salary_max)}</p>
              </div>
            </div>
          )}
          {candidate.profile.availability && (
            <div className="flex items-start gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Availability</p>
                <p className="font-medium mt-0.5 capitalize">{candidate.profile.availability.replace(/_/g, " ")}</p>
              </div>
            </div>
          )}
          {locations.length > 0 && (
            <div className="flex items-start gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Preferred locations</p>
                <p className="font-medium mt-0.5">{locations.join(", ")}</p>
              </div>
            </div>
          )}
          {languages.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Languages</p>
                <p className="font-medium mt-0.5">{languages.join(", ")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {candidate.profile.summary && (
        <Card>
          <CardHeader><CardTitle className="text-base">About me</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{candidate.profile.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {candidate.experiences.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Work experience</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {candidate.experiences.map((exp) => (
              <div key={exp.id} className="border-l-2 border-primary/20 pl-4">
                <p className="font-semibold">{exp.title}</p>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(exp.start_date)} — {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </p>
                {exp.description && (
                  <p className="text-sm mt-1.5 text-muted-foreground">{exp.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {candidate.educations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Education</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {candidate.educations.map((edu) => (
              <div key={edu.id}>
                <p className="font-semibold">{edu.qualification ?? "Qualification"} — {edu.field_of_study}</p>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(edu.start_date)} — {formatDate(edu.end_date)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {candidate.skills.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((cs) => (
                <Badge key={cs.id} variant="secondary">{cs.skill.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
