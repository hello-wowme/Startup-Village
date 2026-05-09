'use client'

import { Coins } from 'lucide-react'

interface CoinDisplayProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CoinDisplay({ amount, size = 'md', className = '' }: CoinDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-xl gap-2',
  }
  const iconSize = { sm: 12, md: 15, lg: 22 }

  return (
    <span className={`inline-flex items-center font-bold ${sizeClasses[size]} ${className}`} style={{ color: '#F59E0B' }}>
      <Coins size={iconSize[size]} />
      {amount.toLocaleString()}
    </span>
  )
}
