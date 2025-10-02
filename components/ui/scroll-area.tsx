import type React from "react"
export function ScrollArea({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={className ? className : ""} style={{ overflow: "auto" }}>
      {children}
    </div>
  )
}
