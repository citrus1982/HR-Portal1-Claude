import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ParsedFieldReview from "@/components/candidate/ParsedFieldReview"

export const metadata = { title: "Review Extracted Fields" }

export default async function ReviewPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const candidate = await prisma.candidate.findUnique({
    where: { user_id: session.user.id },
    include: {
      profile: true,
      parsedFieldAudits: true,
      experiences: true,
      educations: true,
      skills: { include: { skill: true } },
    },
  })

  if (!candidate) redirect("/auth/login")

  // Must have gone through upload first
  if (!candidate.parsedFieldAudits.length && candidate.profile?.onboarding_step === "upload") {
    redirect("/candidate/onboarding/upload")
  }

  if (candidate.profile?.onboarding_step === "done") {
    redirect("/candidate/profile")
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">✓</span>
          <span className="text-muted-foreground">Upload CV</span>
          <span className="mx-2">→</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
          <span className="font-medium text-foreground">Review fields</span>
          <span className="mx-2">→</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">3</span>
          <span>Complete profile</span>
        </div>
        <h1 className="text-2xl font-bold">Review extracted information</h1>
        <p className="text-muted-foreground mt-1">
          We've read your CV. Check each field below — edit anything that looks wrong.
        </p>
      </div>

      <ParsedFieldReview
        audits={candidate.parsedFieldAudits}
        experiences={candidate.experiences}
        educations={candidate.educations}
        skills={candidate.skills.map((cs) => ({ ...cs, name: cs.skill.name }))}
      />
    </div>
  )
}
