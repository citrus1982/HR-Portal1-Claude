"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react"

interface Props {
  candidateName: string
}

export default function CVUploadForm({ candidateName }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "done" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowed.includes(f.type)) {
      setError("Only PDF or Word (.docx) files are accepted")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB")
      return
    }
    setError(null)
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleSubmit = async () => {
    if (!file) return
    setStatus("uploading")
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      setStatus("parsing")
      const res = await fetch("/api/candidate/upload-cv", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Upload failed")
        setStatus("error")
        return
      }

      setStatus("done")
      setTimeout(() => router.push("/candidate/onboarding/review"), 1200)
    } catch {
      setError("Network error. Please try again.")
      setStatus("error")
    }
  }

  const isLoading = status === "uploading" || status === "parsing"

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Hi <strong>{candidateName}</strong>! Upload your CV and we'll fill in your profile automatically.
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : file
            ? "border-green-400 bg-green-50"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-12 w-12 text-green-500" />
            <p className="font-medium text-green-700">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">Drop your CV here or click to browse</p>
            <p className="text-sm text-muted-foreground">PDF or Word (.docx) · Max 10 MB</p>
          </div>
        )}
      </div>

      {/* Status feedback */}
      {status === "parsing" && (
        <Alert variant="info">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="ml-6">
            Reading your CV with AI… this takes about 10–20 seconds.
          </AlertDescription>
        </Alert>
      )}
      {status === "done" && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="ml-6">
            CV parsed! Redirecting you to review the extracted information…
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="ml-6">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <Button onClick={handleSubmit} disabled={!file || isLoading} size="lg" className="w-full">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {status === "uploading" ? "Uploading…" : "Parsing CV with AI…"}</>
          ) : (
            "Upload and parse CV"
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/candidate/onboarding/complete")}
          className="w-full text-muted-foreground"
        >
          Skip — I'll fill in manually
        </Button>
      </div>
    </div>
  )
}
