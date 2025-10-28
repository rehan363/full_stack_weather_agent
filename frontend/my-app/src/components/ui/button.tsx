"use client"

import * as React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline"
  className?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = "", variant = "primary", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants: Record<string, string> = {
      primary:
        "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500 px-4 py-2",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100 px-3 py-1.5",
      outline:
        "bg-transparent border border-sky-300 text-sky-600 hover:bg-sky-50 px-3 py-1.5",
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export default Button
