"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Briefcase, User, Loader2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
  company_name: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "CANDIDATE" },
  })

  const role = watch("role")

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Registration failed")
        return
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push("/auth/login")
        return
      }

      router.push(role === "CANDIDATE" ? "/candidate/onboarding/upload" : "/employer/onboarding/company")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Briefcase className="h-7 w-7" />
            KerjaMY
          </Link>
          <p className="mt-2 text-muted-foreground text-sm">Malaysia's B40 Hiring Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start finding work or hiring talent today — free</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    role === "CANDIDATE" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <input type="radio" value="CANDIDATE" {...register("role")} className="sr-only" />
                  <User className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">I'm looking for work</span>
                  <span className="text-xs text-muted-foreground text-center">Candidate</span>
                </label>
                <label
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    role === "EMPLOYER" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <input type="radio" value="EMPLOYER" {...register("role")} className="sr-only" />
                  <Briefcase className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">I'm hiring</span>
                  <span className="text-xs text-muted-foreground text-center">Employer</span>
                </label>
              </div>

              <div className="space-y-1">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Ahmad bin Ali" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@email.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" placeholder="01X-XXXXXXX" {...register("phone")} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Min. 8 characters" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {role === "EMPLOYER" && (
                <div className="space-y-1">
                  <Label htmlFor="company_name">Company name</Label>
                  <Input id="company_name" placeholder="Your Company Sdn Bhd" {...register("company_name")} />
                  {errors.company_name && (
                    <p className="text-xs text-destructive">{errors.company_name.message}</p>
                  )}
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                ) : (
                  "Create free account"
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By registering you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
