'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ChainBadgeProps {
  chain: string
  className?: string
}

export function ChainBadge({ chain, className }: ChainBadgeProps) {
  const normalized = chain.toLowerCase()

  const colorClass =
    normalized === 'algorand'
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
      : normalized === 'solana'
        ? 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300'
        : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'

  return (
    <Badge variant="secondary" className={cn(colorClass, className)}>
      {chain}
    </Badge>
  )
}
