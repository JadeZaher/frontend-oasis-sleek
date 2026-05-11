'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useOasisAuth } from '@/lib/oasis-auth'
import { useChainInfo } from '@/lib/oasis-hooks'
import { ChainBadge } from '@/components/shared/chain-badge'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorBanner } from '@/components/shared/error-banner'

function ChainInfoCard({ chain }: { chain: string }) {
  const { info, loading, error } = useChainInfo(chain)

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorBanner message={`${chain}: ${error}`} />

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ChainBadge chain={chain} />
          <span className="capitalize">{chain} Network</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {info ? (
          Object.entries(info).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-mono text-xs text-right break-all max-w-[60%]">
                {String(value)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No info available</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function OverviewPage() {
  const { avatarId, isAuthenticated, user } = useOasisAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">System status and network information</p>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Authenticated</span>
            <span className={isAuthenticated ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
              {isAuthenticated ? 'Yes' : 'No'}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avatar ID</span>
            <span className="font-mono text-xs">{avatarId ?? '—'}</span>
          </div>
          {user && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span>{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{user.email}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Chain Info Cards */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Chain Status
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ChainInfoCard chain="algorand" />
          <ChainInfoCard chain="solana" />
        </div>
      </div>
    </div>
  )
}
