"use client"

import * as React from "react"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-md border border-slate-200/10 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        disabled={disabled}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export default Input
