import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CVUploadForm from "@/components/candidate/CVUploadForm"

export const metadata = { title: "Upload Your CV" }

export default async function UploadPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const candidate = await prisma.candidate.findUnique({
    where: { user_id: session.user.id },
    include: { profile: true },
  })

  if (!candidate) redirect("/auth/login")

  // If already past upload step, redirect forward
  if (candidate.profile?.onboarding_step === "review") {
    redirect("/candidate/onboarding/review")
  }
  if (candidate.profile?.onboarding_step === "complete" || candidate.profile?.onboarding_step === "done") {
    redirect("/candidate/onboarding/complete")
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
          <span className="font-medium text-foreground">Upload CV</span>
          <span className="mx-2">→</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">2</span>
          <span>Review fields</span>
          <span className="mx-2">→</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">3</span>
          <span>Complete profile</span>
        </div>
        <h1 className="text-2xl font-bold">Upload your CV</h1>
        <p className="text-muted-foreground mt-1">
          We'll read your CV and fill in your profile automatically. You can review and edit everything before it goes live.
        </p>
      </div>

      <CVUploadForm candidateName={candidate.name} />
    </div>
  )
}
