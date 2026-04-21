import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
  company_name: z.string().optional(),
  registration_no: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = RegisterSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })

    const password_hash = await bcrypt.hash(data.password, 12)

    if (data.role === "CANDIDATE") {
      await prisma.user.create({
        data: {
          email: data.email.toLowerCase(), password_hash, role: "CANDIDATE", phone: data.phone,
          candidate: { create: { name: data.name, profile: { create: { onboarding_step: "upload" } } } },
        },
      })
    } else {
      if (!data.company_name) return NextResponse.json({ error: "Company name is required" }, { status: 400 })
      await prisma.user.create({
        data: {
          email: data.email.toLowerCase(), password_hash, role: "EMPLOYER", phone: data.phone,
          employerUser: {
            create: {
              name: data.name, role: "owner",
              employer: { create: { company_name: data.company_name, registration_no: data.registration_no, industry: data.industry, size: data.company_size } },
            },
          },
        },
      })
    }
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error("Register error:", err)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
