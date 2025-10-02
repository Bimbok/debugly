"use client"

import { useCallback, useRef, useState } from "react"
import { DiffEditor, Editor } from "@/components/code-editor"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ReviewPanel from "@/components/review-panel" // Import ReviewPanel component
import ErrorBoundary from "@/components/error-boundary" // Import ErrorBoundary component

type Issue = {
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  type?: "bug" | "performance" | "security" | "style" | "maintainability"
  lineStart?: number
  lineEnd?: number
  suggestion?: string
}

type ReviewResponse = {
  issues: Issue[]
  fixedCode: string
}

const starterCode = `function add(a, b){
const result=a+b
return result
}
console.log(add(2,"3"))
`

const ThreeBackground = dynamic(() => import("@/components/three-background").then((m) => m.ThreeBackground), {
  ssr: false,
})

export default function HomePage() {
  const [code, setCode] = useState(starterCode)
  const [language, setLanguage] = useState<
    "javascript" | "typescript" | "python" | "java" | "csharp" | "c" | "cpp" | "lua"
  >("javascript")
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [theme, setTheme] = useState<
    | "github-dark"
    | "github-light"
    | "dracula"
    | "monokai"
    | "one-dark"
    | "solarized-dark"
    | "solarized-light"
    | "vs-dark"
    | "vs"
  >("github-dark")
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const onMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }, [])

  const runReview = useCallback(async () => {
    setLoading(true)
    setReview(null)
    try {
      console.log("[v0] Starting review with language:", language)
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, apiKey: apiKey || undefined }),
      })
      if (!res.ok) {
        const t = await res.text()
        console.log("[v0] Review failed status/text:", res.status, t)
        throw new Error(t || "Review failed")
      }
      const data = (await res.json()) as ReviewResponse
      setReview(data)
      try {
        const ed = editorRef.current
        const monaco = monacoRef.current
        if (ed && monaco && data.issues?.length) {
          const decorations = data.issues
            .filter((i) => i.lineStart)
            .map((i) => ({
              range: new monaco.Range(i.lineStart!, 1, (i.lineEnd ?? i.lineStart)!, 1),
              options: {
                isWholeLine: true,
                className: "ai-issue-line",
                glyphMarginClassName:
                  i.severity === "critical" || i.severity === "high" ? "ai-issue-glyph-high" : "ai-issue-glyph",
                hoverMessage: { value: `${i.severity.toUpperCase()}: ${i.title}\n\n${i.description}` },
              },
            }))
          ed.deltaDecorations([], decorations)
        } else {
          console.log("[v0] Skipping decorations; editor or monaco not ready.")
        }
      } catch (decErr: any) {
        console.log("[v0] Decoration error:", decErr?.message || decErr)
      }
    } catch (e: any) {
      alert(e.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }, [apiKey, code, language])

  const applyFix = useCallback(() => {
    if (review?.fixedCode) {
      setCode(review.fixedCode)
      setShowDiff(false)
    }
  }, [review])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ErrorBoundary fallback={<div className="absolute inset-0 bg-background" aria-hidden />}>
          <ThreeBackground />
        </ErrorBoundary>
      </div>

      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary" aria-hidden />
            <span className="font-mono text-sm text-muted-foreground">AI Code Reviewer</span>
          </div>
          <div className="flex items-center gap-2">
            <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#how-it-works">
              How it works
            </a>
          </div>
        </div>
      </header>

      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="text-center mb-8">
            <p className="mb-2 text-xs tracking-widest text-primary">bimbok for Developers</p>
            <h1 className="text-balance text-4xl sm:text-5xl font-semibold">
              Find bugs, optimize, and secure your code
            </h1>
            <p className="mt-3 text-muted-foreground">
              Paste your code, review issues, and auto-fix with AI powered by Gemini.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-pretty">Editor</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lang">Language</Label>
                    <select
                      id="lang"
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="c">C</option>
                      <option value="cpp">C++</option>
                      <option value="lua">Lua</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                    >
                      <option value="github-dark">GitHub Dark</option>
                      <option value="github-light">GitHub Light</option>
                      <option value="dracula">Dracula</option>
                      <option value="monokai">Monokai</option>
                      <option value="one-dark">One Dark</option>
                      <option value="solarized-dark">Solarized Dark</option>
                      <option value="solarized-light">Solarized Light</option>
                      <option value="vs-dark">VS Dark</option>
                      <option value="vs">VS Light</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="apikey">Gemini API Key (optional)</Label>
                    <Input
                      id="apikey"
                      type="password"
                      placeholder="Use project key or paste yours"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      Your key is sent only to this app’s /api/review route.
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                    <Button
                      className="w-full sm:flex-1 min-w-0 truncate"
                      onClick={runReview}
                      disabled={loading}
                      title={loading ? "Reviewing…" : "Review Code"}
                    >
                      {loading ? "Reviewing…" : "Review Code"}
                    </Button>
                    {/* <Button
                      variant="secondary"
                      className="w-full sm:w-auto shrink-0 whitespace-nowrap"
                      onClick={() => setShowDiff((v) => !v)}
                      disabled={!review}
                    >
                      {showDiff ? "Hide Diff" : "Show Diff"}
                    </Button> */}
                  </div>
                </div>

                {(() => {
                  const editorLanguage = language === "c" ? "cpp" : language
                  return !review || !showDiff ? (
                    <Editor language={editorLanguage} theme={theme} value={code} onChange={setCode} onMount={onMount} />
                  ) : (
                    <DiffEditor
                      language={editorLanguage}
                      theme={theme}
                      original={code}
                      modified={review?.fixedCode || code}
                    />
                  )
                })()}
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle>Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReviewPanel
                  issues={review?.issues || []}
                  onJump={(lineStart?: number) => {
                    const ed = editorRef.current
                    if (ed && lineStart) {
                      ed.revealLineInCenter(lineStart)
                      ed.setPosition({ lineNumber: lineStart, column: 1 })
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={applyFix} disabled={!review?.fixedCode}>
                    Apply Auto-Fix
                  </Button>
                  {/* minor hardening around clipboard write to avoid throwing in non-secure contexts */}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (review?.fixedCode) {
                        navigator.clipboard?.writeText?.(review.fixedCode).catch(() => {})
                      }
                    }}
                    disabled={!review?.fixedCode}
                  >
                    Copy Fixed Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div id="how-it-works" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>1. Paste</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Drop your snippet into the editor. We support major languages.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Review</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                AI flags bugs, performance and security issues with line hints.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3. Auto-fix</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Apply safe fixes or compare diffs before updating your code.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
