'use client'

import { useState, useEffect, useCallback } from 'react'
import { oasis, isOk } from '@/lib/oasis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ResultDisplay } from '@/components/shared/result-display'
import { JsonViewer } from '@/components/shared/json-viewer'
import { ChainBadge } from '@/components/shared/chain-badge'

// ─── Types ───

interface NftRecord {
  id: string
  name: string
  chainId: string
  tokenId?: string
  isActive?: boolean
  [key: string]: unknown
}

interface MetadataRow {
  key: string
  value: string
}

// ─── Mint Form ───

function MintNftForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [chainId, setChainId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [imageUri, setImageUri] = useState('')
  const [metadata, setMetadata] = useState<MetadataRow[]>([{ key: '', value: '' }])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [isError, setIsError] = useState(false)

  const addMetadataRow = () => setMetadata((prev) => [...prev, { key: '', value: '' }])
  const removeMetadataRow = (idx: number) =>
    setMetadata((prev) => prev.filter((_, i) => i !== idx))
  const updateMetadataRow = (idx: number, field: 'key' | 'value', val: string) =>
    setMetadata((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const metadataObj: Record<string, string> = {}
    metadata.forEach(({ key, value }) => {
      if (key.trim()) metadataObj[key.trim()] = value
    })

    const res = await oasis.api.mintNft({
      walletId,
      name,
      description,
      chainId,
      imageUri: imageUri || undefined,
      metadata: metadataObj,
    })

    if (isOk(res)) {
      setResult(res.value)
      setIsError(false)
    } else {
      setResult(res.error.message)
      setIsError(true)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mint NFT</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="nft-name">Name</Label>
              <Input
                id="nft-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My NFT"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nft-chain">Chain</Label>
              <Select value={chainId} onValueChange={(v) => setChainId(v ?? '')} required>
                <SelectTrigger id="nft-chain">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algorand">Algorand</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="nft-desc">Description</Label>
            <Input
              id="nft-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this NFT"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nft-wallet">Wallet ID (GUID)</Label>
            <Input
              id="nft-wallet"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nft-image">Image URI (optional)</Label>
            <Input
              id="nft-image"
              value={imageUri}
              onChange={(e) => setImageUri(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Metadata</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMetadataRow}>
                + Add Row
              </Button>
            </div>
            {metadata.map((row, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={row.key}
                  onChange={(e) => updateMetadataRow(idx, 'key', e.target.value)}
                  placeholder="Key"
                  className="flex-1"
                />
                <Input
                  value={row.value}
                  onChange={(e) => updateMetadataRow(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMetadataRow(idx)}
                  disabled={metadata.length === 1}
                >
                  x
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Minting…' : 'Mint NFT'}
          </Button>
        </form>

        {result !== null && (
          <div className="mt-4">
            <ResultDisplay
              result={typeof result === 'string' ? undefined : result}
              message={typeof result === 'string' ? result : undefined}
              isError={isError}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Transfer Dialog ───

function TransferDialog({ nftId, onDone }: { nftId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [targetAvatarId, setTargetAvatarId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [isError, setIsError] = useState(false)

  const handleTransfer = async () => {
    setLoading(true)
    setResult(null)
    const res = await oasis.api.transferNft(nftId, { targetAvatarId, walletId })
    if (isOk(res)) {
      setResult(res.value)
      setIsError(false)
      onDone()
    } else {
      setResult(res.error.message)
      setIsError(true)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Transfer</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer NFT</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Target Avatar ID (GUID)</Label>
            <Input
              value={targetAvatarId}
              onChange={(e) => setTargetAvatarId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>
          <div className="space-y-1">
            <Label>Wallet ID (GUID)</Label>
            <Input
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>
          <Button onClick={handleTransfer} disabled={loading} className="w-full">
            {loading ? 'Transferring…' : 'Transfer'}
          </Button>
          {result !== null && (
            <ResultDisplay
              result={typeof result === 'string' ? undefined : result}
              message={typeof result === 'string' ? result : undefined}
              isError={isError}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Burn Dialog ───

function BurnDialog({ nftId, onDone }: { nftId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [walletId, setWalletId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [isError, setIsError] = useState(false)

  const handleBurn = async () => {
    setLoading(true)
    setResult(null)
    const res = await oasis.api.burnNft(nftId, { walletId })
    if (isOk(res)) {
      setResult(res.value)
      setIsError(false)
      onDone()
    } else {
      setResult(res.error.message)
      setIsError(true)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm">Burn</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Burn NFT</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This action is irreversible. The NFT will be permanently destroyed.
          </p>
          <div className="space-y-1">
            <Label>Wallet ID (GUID)</Label>
            <Input
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>
          <Button variant="destructive" onClick={handleBurn} disabled={loading} className="w-full">
            {loading ? 'Burning…' : 'Confirm Burn'}
          </Button>
          {result !== null && (
            <ResultDisplay
              result={typeof result === 'string' ? undefined : result}
              message={typeof result === 'string' ? result : undefined}
              isError={isError}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── NFT Detail Panel ───

function NftDetailPanel({ nft, onRefresh }: { nft: NftRecord; onRefresh: () => void }) {
  const [metadataResult, setMetadataResult] = useState<unknown>(null)
  const [metadataError, setMetadataError] = useState(false)
  const [metadataLoading, setMetadataLoading] = useState(false)

  const fetchMetadata = async () => {
    setMetadataLoading(true)
    setMetadataResult(null)
    const res = await oasis.api.getNftMetadata(nft.id)
    if (isOk(res)) {
      setMetadataResult(res.value)
      setMetadataError(false)
    } else {
      setMetadataResult(res.error.message)
      setMetadataError(true)
    }
    setMetadataLoading(false)
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>{nft.name}</span>
          <ChainBadge chain={nft.chainId} />
          {nft.isActive !== undefined && (
            <Badge variant={nft.isActive ? 'default' : 'secondary'}>
              {nft.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-1">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-24">ID</span>
            <span className="font-mono text-xs break-all">{nft.id}</span>
          </div>
          {nft.tokenId && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-24">Token ID</span>
              <span className="font-mono text-xs">{nft.tokenId}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <TransferDialog nftId={nft.id} onDone={onRefresh} />
          <BurnDialog nftId={nft.id} onDone={onRefresh} />
          <Button variant="outline" size="sm" onClick={fetchMetadata} disabled={metadataLoading}>
            {metadataLoading ? 'Loading…' : 'View Metadata'}
          </Button>
        </div>

        {metadataResult !== null && (
          <ResultDisplay
            result={typeof metadataResult === 'string' ? undefined : metadataResult}
            message={typeof metadataResult === 'string' ? metadataResult : undefined}
            isError={metadataError}
          />
        )}

        <Separator />

        <div>
          <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Full Record
          </p>
          <JsonViewer data={nft} />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── NFT Gallery ───

function NftGallery() {
  const [nfts, setNfts] = useState<NftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<NftRecord | null>(null)

  const fetchNfts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await oasis.api.request<NftRecord[]>('GET', '/api/nft')
    if (isOk(res)) {
      setNfts(res.value)
    } else {
      setError(res.error.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchNfts() }, [fetchNfts])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24 pt-6" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ResultDisplay result={undefined} message={error} isError />
    )
  }

  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          No NFTs found. Mint your first one above.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nfts.map((nft) => (
          <button
            key={nft.id}
            type="button"
            onClick={() => setSelected(selected?.id === nft.id ? null : nft)}
            className="text-left"
          >
            <Card
              className={`cursor-pointer transition-colors hover:border-primary/50 ${
                selected?.id === nft.id ? 'border-primary' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm truncate">{nft.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ChainBadge chain={nft.chainId} />
                  {nft.isActive !== undefined && (
                    <Badge variant={nft.isActive ? 'default' : 'secondary'} className="text-xs">
                      {nft.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>
                {nft.tokenId && (
                  <p className="font-mono truncate">Token: {nft.tokenId}</p>
                )}
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {selected && (
        <NftDetailPanel nft={selected} onRefresh={fetchNfts} />
      )}
    </div>
  )
}

// ─── Page ───

export default function NftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">NFTs</h1>
        <p className="text-sm text-muted-foreground">
          Mint, transfer, burn, and inspect NFTs across chains
        </p>
      </div>

      <MintNftForm />

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          NFT Gallery
        </h2>
        <NftGallery />
      </div>
    </div>
  )
}
