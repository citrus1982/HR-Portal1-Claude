import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Navbar from "@/components/shared/Navbar"

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CANDIDATE") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
