'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { apiClient, BlockchainResponse } from '@/lib/api'

interface BlockchainInfo {
  chain: string
  network: string
  nodeVersion?: string
  genesisHash?: string
  round?: string
  time?: string
  apiVersion?: string
  totalSupply?: string
  circulatingSupply?: string
}

interface BlockchainDashboardProps {
  selectedChain: string
}

export function BlockchainDashboard({ selectedChain }: BlockchainDashboardProps) {
  const [chainInfo, setChainInfo] = useState<BlockchainInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChainInfo()
  }, [selectedChain])

  const fetchChainInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response: BlockchainResponse<BlockchainInfo> = await apiClient.getChainInfo(selectedChain)

      if (response.success && response.result) {
        setChainInfo(response.result)
      } else {
        setError(response.error || 'Failed to fetch chain info')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold capitalize">
          {selectedChain} Network Status
        </h3>

        {isLoading ? (
          <div className="flex items-center gap-3 py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading network information...</span>
          </div>
        ) : error ? (
          <Card className="border-destructive/40">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="destructive" size="sm" onClick={fetchChainInfo}>Retry</Button>
            </CardContent>
          </Card>
        ) : chainInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Chain</CardTitle>
                <span className="text-2xl">🔗</span>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{chainInfo.chain}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Network</CardTitle>
                <span className="text-2xl">🌐</span>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{chainInfo.network}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">API Version</CardTitle>
                <span className="text-2xl">⚙️</span>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{chainInfo.apiVersion || 'N/A'}</p>
              </CardContent>
            </Card>

            {chainInfo.round && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Round</CardTitle>
                  <span className="text-2xl">🔢</span>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{chainInfo.round}</p>
                </CardContent>
              </Card>
            )}

            {chainInfo.totalSupply && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Supply</CardTitle>
                  <span className="text-2xl">💰</span>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{chainInfo.totalSupply}</p>
                </CardContent>
              </Card>
            )}

            {chainInfo.circulatingSupply && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Circulating Supply</CardTitle>
                  <span className="text-2xl">🪙</span>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{chainInfo.circulatingSupply}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
                <span className="text-2xl">⏰</span>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">
                  {chainInfo.time ? new Date(chainInfo.time).toLocaleString() : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="default" size="sm">Check Balance</Button>
            <Button className="w-full" variant="secondary" size="sm">Validate Address</Button>
            <Button className="w-full" variant="secondary" size="sm">View Transactions</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Provider Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Status</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className="text-sm font-medium">~250ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
