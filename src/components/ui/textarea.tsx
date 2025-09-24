import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "w-full rounded-xl border border-border bg-white px-3 py-2 text-textPrimary placeholder:text-textSecondary/60 focus:border-gold focus:ring-2 focus:ring-gold/40 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 resize-vertical min-h-[80px]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
