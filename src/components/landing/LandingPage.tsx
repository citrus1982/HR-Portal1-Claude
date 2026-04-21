"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Search,
  ShieldCheck,
  Zap,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

const FEATURES_CANDIDATE = [
  { icon: FileText, title: "AI reads your CV", desc: "Upload once — we fill in your profile. Edit anything." },
  { icon: ShieldCheck, title: "Your privacy is protected", desc: "Employers see an anonymized profile first. You decide who gets your contact details." },
  { icon: Zap, title: "Instant notifications", desc: "Get notified the moment a company shows interest." },
]

const FEATURES_EMPLOYER = [
  { icon: Search, title: "Search by skills & location", desc: "Filter candidates by role, location, availability, salary, and language." },
  { icon: Users, title: "Unlock only who you need", desc: "Credit-based system — pay only for candidates you're genuinely interested in." },
  { icon: ShieldCheck, title: "Verified candidates", desc: "Profiles are parsed and quality-scored for completeness." },
]

const STATS = [
  { value: "B40-first", label: "Designed for B40 Malaysians" },
  { value: "AI-powered", label: "Instant CV parsing" },
  { value: "Bilingual", label: "Malay + English" },
  { value: "SME-ready", label: "Credit-based access" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Briefcase className="h-6 w-6" />
            KerjaMY
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center">
        <Badge variant="secondary" className="mb-4">
          🇲🇾 Built for Malaysia
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance max-w-2xl mx-auto">
          Find work or hire talent — <span className="text-primary">fast and fair</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto text-balance">
          KerjaMY connects B40 job seekers with Malaysian SMEs. Upload your CV, get discovered, get hired.
        </p>

        {/* Dual CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              I'm looking for work
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
              I'm hiring talent
              <Briefcase className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Free to register · No credit card required · Mobile-friendly
        </p>
      </section>

      {/* Stats bar */}
      <section className="bg-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — candidates */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <Badge variant="info" className="mb-3">For job seekers</Badge>
          <h2 className="text-3xl font-bold">Your next job is closer than you think</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            No polished resume required. Upload what you have and we handle the rest.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {FEATURES_CANDIDATE.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/auth/register">
            <Button size="lg" className="gap-2">
              Create my free profile <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features — employers */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">For employers</Badge>
            <h2 className="text-3xl font-bold">Find your next hire in minutes</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Browse a pool of verified, quality-scored candidates. Only pay to contact who you want.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {FEATURES_EMPLOYER.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-white p-6 space-y-3">
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="gap-2">
                Start hiring today <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">How it works</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            { step: "1", title: "Upload your CV or fill in manually", desc: "AI reads your CV in seconds and builds your profile automatically." },
            { step: "2", title: "Confirm your details", desc: "Review extracted fields, edit anything that's wrong, then set your job preferences." },
            { step: "3", title: "Get discovered by employers", desc: "Employers see an anonymized preview. When they're interested, they unlock your full profile." },
            { step: "4", title: "Track everything in one place", desc: "See who viewed you, track interview stages, and get WhatsApp-friendly contact options." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-4 rounded-xl border bg-card">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {step}
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-primary-foreground/80 max-w-md mx-auto">
            Join thousands of Malaysian job seekers and employers on KerjaMY.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                Find work now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-primary gap-2">
                Start hiring <Briefcase className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Briefcase className="h-4 w-4 text-primary" />
            KerjaMY
          </div>
          <p>© {new Date().getFullYear()} KerjaMY. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
