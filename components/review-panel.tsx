"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type Issue = {
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  type?: "bug" | "performance" | "security" | "style" | "maintainability"
  lineStart?: number
  lineEnd?: number
  suggestion?: string
}

export function ReviewPanel({ issues, onJump }: { issues: Issue[]; onJump: (lineStart?: number) => void }) {
  if (!issues?.length) {
    return <p className="text-sm text-muted-foreground">Run a review to see findings.</p>
  }

  return (
    <ScrollArea className="h-[60vh] pr-2">
      <div className="space-y-3">
        {issues.map((i, idx) => (
          <div
            key={idx}
            className="rounded-md border p-3 hover:bg-accent/40 transition-colors cursor-pointer"
            onClick={() => onJump(i.lineStart)}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{i.title}</div>
              <div className="flex items-center gap-2">
                {i.type ? <Badge variant="outline">{i.type}</Badge> : null}
                <SeverityBadge level={i.severity} />
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
            {i.lineStart ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Lines {i.lineStart}
                {i.lineEnd && i.lineEnd !== i.lineStart ? `–${i.lineEnd}` : ""}
              </p>
            ) : null}
            {i.suggestion ? <p className="mt-1 text-xs text-foreground/80">Suggestion: {i.suggestion}</p> : null}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function SeverityBadge({ level }: { level: Issue["severity"] }) {
  const map: Record<Issue["severity"], { label: string; className: string }> = {
    low: { label: "Low", className: "bg-muted text-muted-foreground" },
    medium: { label: "Medium", className: "bg-accent text-accent-foreground" },
    high: { label: "High", className: "bg-primary text-primary-foreground" },
    critical: { label: "Critical", className: "bg-(--color-amber) text-black" },
  }
  const cfg = map[level]
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
