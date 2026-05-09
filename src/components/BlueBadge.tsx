'use client'

import { BadgeCheck } from 'lucide-react'

interface BlueBadgeProps {
  size?: number
  className?: string
}

export function BlueBadge({ size = 16, className = '' }: BlueBadgeProps) {
  return (
    <BadgeCheck
      size={size}
      className={`text-blue-500 fill-blue-500 inline-block ${className}`}
      aria-label="ブルーバッジ"
    />
  )
}
