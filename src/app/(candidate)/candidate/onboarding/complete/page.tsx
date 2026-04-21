import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EmployabilityForm from "@/components/candidate/EmployabilityForm"

export const metadata = { title: "Complete Your Profile" }

export default async function CompletePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const candidate = await prisma.candidate.findUnique({
    where: { user_id: session.user.id },
    include: { profile: true },
  })

  if (!candidate) redirect("/auth/login")

  if (candidate.profile?.onboarding_step === "upload") {
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
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">✓</span>
          <span className="text-muted-foreground">Review fields</span>
          <span className="mx-2">→</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">3</span>
          <span className="font-medium text-foreground">Complete profile</span>
        </div>
        <h1 className="text-2xl font-bold">Tell employers what you're looking for</h1>
        <p className="text-muted-foreground mt-1">
          This information helps employers find you. It takes less than 2 minutes.
        </p>
      </div>

      <EmployabilityForm
        defaultValues={{
          target_role: candidate.profile?.target_role ?? "",
          sector: candidate.profile?.sector ?? "",
          seniority_level: candidate.profile?.seniority_level ?? "",
          preferred_locations: (candidate.profile?.preferred_locations as string[]) ?? [],
          salary_min: candidate.profile?.salary_min ?? undefined,
          salary_max: candidate.profile?.salary_max ?? undefined,
          availability: candidate.profile?.availability ?? "",
          work_authorization: candidate.profile?.work_authorization ?? "",
          languages: (candidate.profile?.languages as string[]) ?? [],
        }}
      />
    </div>
  )
}
