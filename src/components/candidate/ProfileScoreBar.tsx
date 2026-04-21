"use client"

import { Progress } from "@/components/ui/progress"

interface ProfileScoreBarProps {
  score: number
}

export default function ProfileScoreBar({ score }: ProfileScoreBarProps) {
  const getColor = () => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-400"
  }

  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full transition-all duration-700 ease-out ${getColor()}`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}
