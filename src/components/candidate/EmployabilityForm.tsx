"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import {
  MALAYSIAN_STATES,
  SECTORS,
  AVAILABILITY_OPTIONS,
  WORK_AUTH_OPTIONS,
  SENIORITY_LEVELS,
  LANGUAGES,
} from "@/lib/utils"

const schema = z.object({
  target_role: z.string().min(1, "Required"),
  sector: z.string().min(1, "Required"),
  seniority_level: z.string().min(1, "Required"),
  salary_min: z.coerce.number().int().min(0),
  salary_max: z.coerce.number().int().min(0),
  availability: z.string().min(1, "Required"),
  work_authorization: z.string().min(1, "Required"),
})

type FormData = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<{
    target_role: string
    sector: string
    seniority_level: string
    preferred_locations: string[]
    salary_min: number
    salary_max: number
    availability: string
    work_authorization: string
    languages: string[]
  }>
}

export default function EmployabilityForm({ defaultValues }: Props) {
  const router = useRouter()
  const [locations, setLocations] = useState<string[]>(defaultValues?.preferred_locations ?? [])
  const [langs, setLangs] = useState<string[]>(defaultValues?.languages ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      target_role: defaultValues?.target_role ?? "",
      sector: defaultValues?.sector ?? "",
      seniority_level: defaultValues?.seniority_level ?? "",
      salary_min: defaultValues?.salary_min ?? 2000,
      salary_max: defaultValues?.salary_max ?? 5000,
      availability: defaultValues?.availability ?? "",
      work_authorization: defaultValues?.work_authorization ?? "",
    },
  })

  const toggleLocation = (loc: string) =>
    setLocations((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]))

  const toggleLang = (lang: string) =>
    setLangs((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          preferred_locations: locations,
          languages: langs,
        }),
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j.error || "Failed to save")
        return
      }
      router.push("/candidate/profile")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Target role *</Label>
          <Input placeholder="e.g. Cashier, Driver, Admin" {...register("target_role")} />
          {errors.target_role && <p className="text-xs text-destructive">{errors.target_role.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Sector *</Label>
          <Select {...register("sector")} placeholder="Select sector">
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          {errors.sector && <p className="text-xs text-destructive">{errors.sector.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Seniority level *</Label>
          <Select {...register("seniority_level")} placeholder="Select level">
            {SENIORITY_LEVELS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          {errors.seniority_level && <p className="text-xs text-destructive">{errors.seniority_level.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Availability *</Label>
          <Select {...register("availability")} placeholder="When can you start?">
            {AVAILABILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          {errors.availability && <p className="text-xs text-destructive">{errors.availability.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Work authorization *</Label>
          <Select {...register("work_authorization")} placeholder="Select status">
            {WORK_AUTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          {errors.work_authorization && <p className="text-xs text-destructive">{errors.work_authorization.message}</p>}
        </div>
      </div>

      {/* Salary range */}
      <div className="space-y-2">
        <Label>Expected monthly salary (RM) *</Label>
        <div className="flex items-center gap-3">
          <Input type="number" min={0} step={100} placeholder="Min" {...register("salary_min")} className="w-32" />
          <span className="text-muted-foreground">to</span>
          <Input type="number" min={0} step={100} placeholder="Max" {...register("salary_max")} className="w-32" />
        </div>
        {(errors.salary_min || errors.salary_max) && (
          <p className="text-xs text-destructive">Enter a valid salary range</p>
        )}
      </div>

      {/* Preferred locations */}
      <div className="space-y-2">
        <Label>Preferred work locations <span className="text-muted-foreground font-normal">(select all that apply)</span></Label>
        <div className="flex flex-wrap gap-2">
          {MALAYSIAN_STATES.map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => toggleLocation(state)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                locations.includes(state)
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background hover:border-muted-foreground/50"
              }`}
            >
              {state}
            </button>
          ))}
        </div>
        {locations.length > 0 && (
          <p className="text-xs text-muted-foreground">{locations.length} selected</p>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label>Languages spoken <span className="text-muted-foreground font-normal">(select all that apply)</span></Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLang(lang)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                langs.includes(lang)
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background hover:border-muted-foreground/50"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving profile…</>
        ) : (
          "Save and view my profile"
        )}
      </Button>
    </form>
  )
}
