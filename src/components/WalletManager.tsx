'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { apiClient, BlockchainResponse } from '@/lib/api'

interface WalletInfo {
  address: string
  balance: string
  tokens: Array<{
    address: string
    balance: string
    name?: string
    symbol?: string
    decimals?: number
  }>
  isConnected: boolean
}

interface WalletManagerProps {
  selectedChain: string
}

export function WalletManager({ selectedChain }: WalletManagerProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addressInput, setAddressInput] = useState('')
  const [showConnectDialog, setShowConnectDialog] = useState(false)

  const sampleAddresses: Record<string, string> = {
    algorand: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
    solana: 'So11111111111111111111111111111111111111112',
  }

  useEffect(() => {
    loadSampleWallet()
  }, [selectedChain])

  const loadSampleWallet = async () => {
    const address = sampleAddresses[selectedChain]
    if (address) {
      await fetchWalletInfo(address)
    }
  }

  const fetchWalletInfo = async (address: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const balanceResponse: BlockchainResponse = await apiClient.getBalance({
        address,
        tokenId: selectedChain === 'solana' ? 'SOL' : undefined,
      })

      let balance = '0'
      if (balanceResponse.success && balanceResponse.result) {
        balance = balanceResponse.result.balance || '0'
      }

      let tokens: WalletInfo['tokens'] = []
      if (selectedChain === 'solana') {
        const tokensResponse: BlockchainResponse = await apiClient.getTokensByOwner({ address })
        if (tokensResponse.success && tokensResponse.result) {
          tokens = tokensResponse.result.map((token: any) => ({
            address: token.address,
            balance: token.balance,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
          }))
        }
      }

      setWalletInfo({
        address,
        balance,
        tokens,
        isConnected: true,
      })
    } catch (err) {
      setError('Failed to load wallet information')
      setWalletInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (addressInput.trim()) {
      await fetchWalletInfo(addressInput.trim())
      setShowConnectDialog(false)
      setAddressInput('')
    }
  }

  const formatAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-8)}`

  const formatBalance = (balance: string, decimals: number = 6) => {
    const num = parseFloat(balance)
    if (isNaN(num)) return '0'
    return num.toFixed(decimals)
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Wallet Manager</h3>
          <Button onClick={() => setShowConnectDialog(true)}>Connect Wallet</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading wallet...</span>
          </div>
        ) : error ? (
          <Card className="border-destructive/40">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : walletInfo ? (
          <div className="space-y-6">
            {/* Wallet Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Wallet Overview</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatAddress(walletInfo.address)}
                    </p>
                  </div>
                  <Badge>Connected</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Native Balance</p>
                    <p className="text-2xl font-bold">
                      {formatBalance(walletInfo.balance)} {selectedChain === 'algorand' ? 'ALGO' : 'SOL'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Token Count</p>
                    <p className="text-2xl font-bold">{walletInfo.tokens.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Holdings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Token Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {walletInfo.tokens.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-muted-foreground">No tokens found</p>
                    <Button variant="secondary" size="sm">Import Tokens</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {walletInfo.tokens.map((token, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm">
                            {token.symbol?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{token.symbol || 'Unknown Token'}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {formatAddress(token.address)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatBalance(token.balance, token.decimals)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {token.symbol || 'Tokens'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button>Send {selectedChain === 'algorand' ? 'ALGO' : 'SOL'}</Button>
              <Button variant="secondary">Receive {selectedChain === 'algorand' ? 'ALGO' : 'SOL'}</Button>
              <Button variant="secondary">View History</Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wm-address">Wallet Address</Label>
                <Input
                  id="wm-address"
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder={`Enter ${selectedChain} address...`}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowConnectDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Connect</Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
