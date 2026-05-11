'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { JsonViewer } from './json-viewer'

interface ResultDisplayProps {
  result?: unknown
  isError?: boolean
  message?: string
  loading?: boolean
}

export function ResultDisplay({
  result,
  isError = false,
  message,
  loading = false,
}: ResultDisplayProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!result && !message) return null

  return (
    <Card
      className={cn(
        'border',
        isError
          ? 'border-destructive/50 bg-destructive/5'
          : 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            'text-sm font-medium',
            isError ? 'text-destructive' : 'text-green-700 dark:text-green-400'
          )}
        >
          {isError ? 'Error' : 'Success'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && <p className="mb-2 text-sm">{message}</p>}
        {result !== undefined && result !== null && (
          <JsonViewer data={result} />
        )}
      </CardContent>
    </Card>
  )
}
