'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useOasisAuth } from '@/lib/oasis-auth'
import { oasis } from '@/lib/oasis'
import { JsonViewer } from '@/components/shared/json-viewer'

const PROVIDER_KEY = 'oasis_provider_name'

function maskToken(token: string | null): string {
  if (!token) return '—'
  if (token.length <= 16) return token
  return `${token.slice(0, 8)}...${token.slice(-8)}`
}

export default function SettingsPage() {
  const { avatarId, isAuthenticated, user, logout } = useOasisAuth()

  const [token, setToken] = useState<string | null>(null)
  const [providerName, setProviderName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('oasis_token') ?? localStorage.getItem('token'))
      setProviderName(localStorage.getItem(PROVIDER_KEY) ?? '')
    }
  }, [])

  const handleSaveProvider = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROVIDER_KEY, providerName)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearSession = async () => {
    await oasis.auth.logout()
    await logout()
  }

  // Derive chain list from SDK config
  const chains = oasis.wallet?.chains ?? {}
  const chainNames = Object.keys(chains)

  // Session state for raw viewer
  const sessionState = {
    avatarId,
    isAuthenticated,
    user,
    tokenMasked: maskToken(token),
  }

  const apiBaseUrl = (oasis as unknown as { config?: { apiUrl?: string } }).config?.apiUrl
    ?? process.env.NEXT_PUBLIC_API_URL
    ?? 'http://localhost:5000'

  const rpcUrls: Record<string, string> = {
    algorand: process.env.NEXT_PUBLIC_ALGO_RPC ?? 'https://testnet-algod.algonode.cloud',
    solana: process.env.NEXT_PUBLIC_SOL_RPC ?? 'https://api.devnet.solana.com',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Session details, SDK configuration, and debug tools</p>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Authenticated</span>
            <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
              {isAuthenticated ? 'Active' : 'Unauthenticated'}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avatar ID</span>
            <span className="font-mono text-xs">{avatarId ?? '—'}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">JWT Token</span>
            <span className="font-mono text-xs text-right max-w-[55%] break-all">
              {maskToken(token)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* SDK Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">SDK Configuration</CardTitle>
          <CardDescription>Registered chains and API endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">API Base URL</span>
            <span className="font-mono text-xs">{apiBaseUrl}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Registered Chains</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {chainNames.length > 0
                ? chainNames.map(c => (
                    <Badge key={c} variant="outline" className="capitalize text-xs">
                      {c}
                    </Badge>
                  ))
                : <span className="text-xs text-muted-foreground">none</span>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Config */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Network Configuration</CardTitle>
          <CardDescription>RPC endpoints for each chain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {Object.entries(rpcUrls).map(([chain, url], i) => (
            <div key={chain}>
              {i > 0 && <Separator className="my-2" />}
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground capitalize">{chain} RPC</span>
                <span className="font-mono text-xs text-right break-all max-w-[65%]">{url}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Provider Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Provider Override</CardTitle>
          <CardDescription>
            Set a provider name for OASIS requests. Stored in localStorage — informational only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="providerName">Provider Name</Label>
            <div className="flex gap-2">
              <Input
                id="providerName"
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                placeholder="e.g. MongoOASIS, Neo4JOASIS"
                className="max-w-sm"
              />
              <Button onClick={handleSaveProvider} variant="secondary">
                {saved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger / Session Actions */}
      <Card className="border-destructive/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-destructive">Session Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClearSession}>
            Clear Session
          </Button>
        </CardContent>
      </Card>

      {/* Raw Session State */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Raw Session State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-3 text-sm font-mono">
            <JsonViewer data={sessionState} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
