import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "KerjaMY — B40 Hiring Marketplace", template: "%s | KerjaMY" },
  description: "Malaysia's hiring platform connecting B40 job seekers with SME employers.",
  keywords: ["jobs malaysia", "kerja malaysia", "hiring", "b40", "sme"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
