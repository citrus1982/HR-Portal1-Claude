import type { NextConfig } from "next"

const config: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth", "@anthropic-ai/sdk"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
    ],
  },
}

export default config
