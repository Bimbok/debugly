import type React from "react"
import { cn } from "@/lib/utils"

export function Badge({
  className,
  children,
  variant = "default",
}: { className?: string; children: React.ReactNode; variant?: "default" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "outline"
          ? "border-border bg-transparent text-foreground"
          : "border-transparent bg-accent text-accent-foreground",
        className,
      )}
    >
      {children}
    </span>
  )
}
