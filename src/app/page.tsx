import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import LandingPage from "@/components/landing/LandingPage"

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role === "CANDIDATE") redirect("/candidate/onboarding/upload")
  if (session?.user.role === "EMPLOYER") redirect("/employer/search")
  if (session?.user.role === "ADMIN") redirect("/admin/dashboard")
  return <LandingPage />
}
