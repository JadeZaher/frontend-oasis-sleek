'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { oasis, isOk } from '@/lib/oasis'
import type { ChainBalance } from '@/lib/oasis'
import { usePortfolio } from '@/lib/oasis-hooks'
import { useOasis } from '@/lib/oasis-context'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ChainBadge } from '@/components/shared/chain-badge'
import { ErrorBanner } from '@/components/shared/error-banner'

// ─── Types ───

interface Wallet {
  id: string
  chainType: string
  address: string
  label?: string
  isDefault: boolean
}

interface WalletForm {
  chainType: string
  address: string
  label: string
  isDefault: boolean
}

// ─── Helpers ───

function truncateAddress(addr: string, chars = 6): string {
  if (addr.length <= chars * 2 + 3) return addr
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`
}

// ─── CreateWalletDialog ───

const DEFAULT_WALLET_FORM: WalletForm = {
  chainType: 'Algorand',
  address: '',
  label: '',
  isDefault: false,
}

function CreateWalletDialog() {
  const { addWallet } = useOasis()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<WalletForm>(DEFAULT_WALLET_FORM)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.address.trim()) {
      toast.error('Wallet address is required')
      return
    }
    setLoading(true)
    const result = await addWallet({
      chainType: form.chainType,
      address: form.address.trim(),
      label: form.label.trim() || undefined,
      isDefault: form.isDefault,
    })
    setLoading(false)
    if (result.success) {
      toast.success('Wallet added')
      setOpen(false)
      setForm(DEFAULT_WALLET_FORM)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Add Wallet</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Chain</Label>
            <Select
              value={form.chainType}
              onValueChange={(v: string | null) => {
                if (v) setForm((f) => ({ ...f, chainType: v }))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Algorand">Algorand</SelectItem>
                <SelectItem value="Solana">Solana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Address *</Label>
            <Input
              placeholder="Wallet address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Label</Label>
            <Input
              placeholder="Optional label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isDefault"
              checked={form.isDefault}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, isDefault: checked === true }))
              }
            />
            <Label htmlFor="isDefault">Set as default</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding…' : 'Add Wallet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── DeleteWalletDialog ───

function DeleteWalletDialog({ wallet }: { wallet: Wallet }) {
  const { removeWallet } = useOasis()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await removeWallet(wallet.id)
    setLoading(false)
    if (result.success) {
      toast.success('Wallet removed')
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Wallet</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Remove wallet{' '}
          <span className="font-mono">{truncateAddress(wallet.address)}</span>? This cannot be
          undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Removing…' : 'Remove'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── PortfolioCard ───

function PortfolioCard({ avatarId }: { avatarId: string }) {
  const { portfolio, loading, error, refresh } = usePortfolio(avatarId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <ErrorBanner message={error} onRetry={refresh} />
        ) : !portfolio ? (
          <p className="text-sm text-muted-foreground">No portfolio data available.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total wallets</span>
              <span className="font-medium">{portfolio.walletCount}</span>
            </div>
            <Separator />
            {portfolio.chains && portfolio.chains.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Balances by Chain
                </p>
                {portfolio.chains.map((chain: ChainBalance) => (
                  <div
                    key={chain.chain + chain.address}
                    className="flex items-center justify-between text-sm"
                  >
                    <ChainBadge chain={chain.chain} />
                    <span className="font-mono">
                      {chain.balance.amount} {chain.balance.symbol}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No chain balances found.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── WalletTable ───

function WalletTable({
  wallets,
  loading,
  error,
  onRefresh,
}: {
  wallets: Wallet[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}) {
  const { setDefaultWallet } = useOasis()
  const [settingDefault, setSettingDefault] = useState<string | null>(null)

  const setDefault = async (wallet: Wallet) => {
    setSettingDefault(wallet.id)
    await setDefaultWallet(wallet.id)
    setSettingDefault(null)
    toast.success('Default wallet updated')
    onRefresh()
  }

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorBanner message={error} onRetry={onRefresh} />
      </div>
    )
  }

  if (wallets.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">
        No wallets found. Add one to get started.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Default</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wallets.map((w) => (
          <TableRow key={w.id}>
            <TableCell className="font-mono text-sm">{truncateAddress(w.address)}</TableCell>
            <TableCell>
              <ChainBadge chain={w.chainType} />
            </TableCell>
            <TableCell>
              {w.label ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell>
              {w.isDefault ? (
                <Badge>Default</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                {!w.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={settingDefault === w.id}
                    onClick={() => setDefault(w)}
                  >
                    {settingDefault === w.id ? 'Setting…' : 'Set Default'}
                  </Button>
                )}
                <DeleteWalletDialog wallet={w} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── Main page ───

export default function WalletsPage() {
  const { wallets, walletsLoading: loading, walletsError: error, refreshWallets: refresh, avatarId, addWallet, removeWallet, setDefaultWallet } = useOasis()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-sm text-muted-foreground">
            Manage your blockchain wallets and portfolio
          </p>
        </div>
        {avatarId && <CreateWalletDialog />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Wallet list — 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Wallets {!loading && `(${wallets.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <WalletTable
                wallets={wallets}
                loading={loading}
                error={error}
                onRefresh={refresh}
              />
            </CardContent>
          </Card>
        </div>

        {/* Portfolio — 1/3 width */}
        <div>
          {avatarId ? (
            <PortfolioCard avatarId={avatarId} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Sign in to view portfolio.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
