"use client"

import * as React from "react"

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white/5 backdrop-blur-sm border border-slate-200/5 rounded-lg shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
