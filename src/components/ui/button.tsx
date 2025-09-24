import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition shadow-soft disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:brightness-110 active:scale-[.98]",
        secondary: "bg-gold text-white hover:brightness-110 active:scale-[.98]",
        outline: "border border-gold text-textPrimary bg-transparent hover:bg-gold/10 active:scale-[.98]",
        ghost: "hover:bg-gold/10 active:scale-[.98]",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:scale-[.98]",
      },
      size: {
        default: "px-5 py-3",
        sm: "px-3 py-2 text-sm",
        lg: "px-6 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
