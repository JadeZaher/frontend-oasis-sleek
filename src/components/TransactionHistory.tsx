'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { apiClient } from '@/lib/api'

interface Transaction {
  id: string
  hash: string
  type: 'transfer' | 'mint' | 'burn' | 'create_asa' | 'opt_in'
  status: 'pending' | 'confirmed' | 'failed'
  from?: string
  to?: string
  amount?: string
  tokenId?: string
  timestamp: Date
  fee?: string
  block?: string
}

interface TransactionHistoryProps {
  selectedChain: string
}

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    hash: 'TX1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'transfer',
    status: 'confirmed',
    from: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
    to: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    amount: '1.5',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    fee: '0.001',
    block: '12345678',
  },
  {
    id: '2',
    hash: 'TX0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
    type: 'create_asa',
    status: 'confirmed',
    from: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
    amount: '1000',
    tokenId: '123456789',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    fee: '0.005',
    block: '12345670',
  },
  {
    id: '3',
    hash: 'TX5555555555555555555555555555555555555555555555555555555555555555',
    type: 'transfer',
    status: 'pending',
    from: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
    to: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    amount: '0.5',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    fee: '0.001',
  },
]

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'confirmed':
      return 'default' as const
    case 'pending':
      return 'secondary' as const
    case 'failed':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function typeIcon(type: string) {
  switch (type) {
    case 'transfer': return '💸'
    case 'mint': return '🎨'
    case 'burn': return '🔥'
    case 'create_asa': return '✨'
    case 'opt_in': return '📝'
    default: return '📝'
  }
}

function formatAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

function formatHash(hash: string) {
  return `${hash.slice(0, 12)}...${hash.slice(-12)}`
}

export function TransactionHistory({ selectedChain }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [selectedChain])

  const loadTransactions = () => {
    try {
      setIsLoading(true)
      setError(null)
      setTransactions(sampleTransactions)
    } catch (err) {
      setError('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmed = transactions.filter((t) => t.status === 'confirmed').length
  const pending = transactions.filter((t) => t.status === 'pending').length
  const failed = transactions.filter((t) => t.status === 'failed').length

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <Button variant="secondary" size="sm" onClick={loadTransactions}>
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading transactions...</span>
          </div>
        ) : error ? (
          <Card className="border-destructive/40">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{transactions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-green-600">{confirmed}</p>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-destructive">{failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <button
                        key={tx.id}
                        type="button"
                        className="w-full text-left border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTx(tx)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{typeIcon(tx.type)}</span>
                            <div>
                              <p className="font-medium text-sm capitalize">{tx.type}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatHash(tx.hash)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusBadgeVariant(tx.status)} className="text-xs capitalize">
                              {tx.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {tx.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {tx.from && tx.to && (
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              From: {formatAddress(tx.from)}
                            </span>
                            <span className="text-muted-foreground">
                              To: {formatAddress(tx.to)}
                            </span>
                          </div>
                        )}

                        {tx.amount && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">
                              {tx.amount}{' '}
                              {tx.tokenId
                                ? `Token ${tx.tokenId.slice(0, 8)}...`
                                : selectedChain === 'algorand'
                                  ? 'ALGO'
                                  : 'SOL'}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => { if (!open) setSelectedTx(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Hash</p>
                    <p className="font-mono break-all">{selectedTx.hash}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Status</p>
                    <Badge variant={statusBadgeVariant(selectedTx.status)} className="capitalize">
                      {selectedTx.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Type</p>
                    <p className="capitalize">{selectedTx.type}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Timestamp</p>
                    <p>{selectedTx.timestamp.toLocaleString()}</p>
                  </div>
                  {selectedTx.from && (
                    <div>
                      <p className="font-medium text-muted-foreground">From</p>
                      <p className="font-mono text-xs">{selectedTx.from}</p>
                    </div>
                  )}
                  {selectedTx.to && (
                    <div>
                      <p className="font-medium text-muted-foreground">To</p>
                      <p className="font-mono text-xs">{selectedTx.to}</p>
                    </div>
                  )}
                  {selectedTx.amount && (
                    <div>
                      <p className="font-medium text-muted-foreground">Amount</p>
                      <p>{selectedTx.amount}</p>
                    </div>
                  )}
                  {selectedTx.fee && (
                    <div>
                      <p className="font-medium text-muted-foreground">Fee</p>
                      <p>{selectedTx.fee}</p>
                    </div>
                  )}
                  {selectedTx.block && (
                    <div>
                      <p className="font-medium text-muted-foreground">Block</p>
                      <p>{selectedTx.block}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button size="sm">View on Explorer</Button>
                <Button variant="secondary" size="sm">Copy Hash</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
