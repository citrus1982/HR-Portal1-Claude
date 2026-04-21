import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Unlock, MessageSquare, TrendingUp } from "lucide-react"

export const metadata = { title: "My Activity" }

const STAGE_LABELS: Record<string, { label: string; variant: "default" | "success" | "warning" | "info" | "destructive" | "outline" | "secondary" }> = {
  shortlisted: { label: "Shortlisted", variant: "info" },
  interview: { label: "Interview", variant: "warning" },
  offer: { label: "Offer received", variant: "success" },
  hired: { label: "Hired 🎉", variant: "success" },
  rejected: { label: "Not selected", variant: "outline" },
}

export default async function ActivityPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const candidate = await prisma.candidate.findUnique({
    where: { user_id: session.user.id },
    include: {
      unlocks: {
        include: { employer: { select: { company_name: true, industry: true } } },
        orderBy: { unlocked_at: "desc" },
        take: 20,
      },
      hiringStages: {
        include: { employer: { select: { company_name: true } } },
        orderBy: { updated_at: "desc" },
        take: 20,
      },
      contacts: {
        include: { employer: { select: { company_name: true } } },
        orderBy: { first_contact_at: "desc" },
        take: 20,
      },
    },
  })

  if (!candidate) redirect("/auth/login")

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-muted-foreground mt-1">Track who's interested in you and where you are in their process.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Profile views", value: candidate.unlocks.length, icon: Unlock },
          { label: "Contacts received", value: candidate.contacts.length, icon: MessageSquare },
          { label: "In pipeline", value: candidate.hiringStages.length, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <Icon className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hiring stages */}
      {candidate.hiringStages.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Hiring pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {candidate.hiringStages.map((stage) => {
              const s = STAGE_LABELS[stage.stage] ?? { label: stage.stage, variant: "outline" as const }
              return (
                <div key={stage.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{stage.employer.company_name}</p>
                    <p className="text-xs text-muted-foreground">Updated {formatDate(stage.updated_at)}</p>
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Profile unlocks */}
      {candidate.unlocks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Unlock className="h-4 w-4" />Companies who viewed your profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {candidate.unlocks.map((unlock) => (
              <div key={unlock.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{unlock.employer.company_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {unlock.employer.industry} · Unlocked {formatDate(unlock.unlocked_at)}
                  </p>
                </div>
                <Badge variant="info">Viewed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contacts */}
      {candidate.contacts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />Contact requests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {candidate.contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{contact.employer.company_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Via {contact.channel} · {formatDate(contact.first_contact_at)}
                  </p>
                </div>
                <Badge variant={contact.message_status === "replied" ? "success" : "secondary"}>
                  {contact.message_status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {candidate.unlocks.length === 0 && candidate.hiringStages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No activity yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure your profile is visible and complete to attract employers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
