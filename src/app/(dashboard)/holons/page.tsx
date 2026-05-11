'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { oasis, isOk } from '@/lib/oasis'
import type { HolonResult } from '@/lib/oasis'
import { useOasisAuth } from '@/lib/oasis-auth'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { JsonViewer } from '@/components/shared/json-viewer'
import { ErrorBanner } from '@/components/shared/error-banner'

// ─── Types ───

interface Filters {
  name: string
  chainId: string
  assetType: string
  isActive: boolean | undefined
}

interface HolonFormState {
  name: string
  description: string
  providerName: string
  chainId: string
  assetType: string
  metadataKeys: string[]
  metadataValues: string[]
}

// ─── Defaults ───

const DEFAULT_FILTERS: Filters = {
  name: '',
  chainId: 'any',
  assetType: '',
  isActive: undefined,
}

const DEFAULT_FORM: HolonFormState = {
  name: '',
  description: '',
  providerName: '',
  chainId: 'algorand',
  assetType: '',
  metadataKeys: [''],
  metadataValues: [''],
}

// ─── Helpers ───

function buildMetadata(keys: string[], values: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  keys.forEach((k, i) => {
    if (k.trim()) result[k.trim()] = values[i] ?? ''
  })
  return result
}

// ─── MetadataEditor ───

function MetadataEditor({
  keys,
  values,
  onChange,
}: {
  keys: string[]
  values: string[]
  onChange: (keys: string[], values: string[]) => void
}) {
  const addPair = () => onChange([...keys, ''], [...values, ''])
  const removePair = (i: number) => {
    const ks = keys.filter((_, idx) => idx !== i)
    const vs = values.filter((_, idx) => idx !== i)
    onChange(ks.length ? ks : [''], vs.length ? vs : [''])
  }
  const updateKey = (i: number, val: string) => {
    const ks = [...keys]
    ks[i] = val
    onChange(ks, values)
  }
  const updateVal = (i: number, val: string) => {
    const vs = [...values]
    vs[i] = val
    onChange(keys, vs)
  }

  return (
    <div className="space-y-2">
      <Label>Metadata</Label>
      {keys.map((k, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="Key"
            value={k}
            onChange={(e) => updateKey(i, e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={values[i] ?? ''}
            onChange={(e) => updateVal(i, e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removePair(i)}
            disabled={keys.length === 1}
          >
            &times;
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addPair}>
        + Add pair
      </Button>
    </div>
  )
}

// ─── HolonForm ───

function HolonForm({
  form,
  onChange,
}: {
  form: HolonFormState
  onChange: (f: HolonFormState) => void
}) {
  const set =
    (field: keyof HolonFormState) =>
    (val: string) =>
      onChange({ ...form, [field]: val })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Name *</Label>
          <Input value={form.name} onChange={(e) => set('name')(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Provider Name</Label>
          <Input
            value={form.providerName}
            onChange={(e) => set('providerName')(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Input value={form.description} onChange={(e) => set('description')(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Chain</Label>
          <Select
            value={form.chainId}
            onValueChange={(v: string | null) => {
              if (v) set('chainId')(v)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="algorand">Algorand</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Asset Type</Label>
          <Input value={form.assetType} onChange={(e) => set('assetType')(e.target.value)} />
        </div>
      </div>
      <MetadataEditor
        keys={form.metadataKeys}
        values={form.metadataValues}
        onChange={(ks, vs) => onChange({ ...form, metadataKeys: ks, metadataValues: vs })}
      />
    </div>
  )
}

// ─── CreateHolonDialog ───

function CreateHolonDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<HolonFormState>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setLoading(true)
    const result = await oasis.holons.create({
      name: form.name,
      description: form.description,
      providerName: form.providerName,
      chainId: form.chainId,
      assetType: form.assetType,
      metadata: buildMetadata(form.metadataKeys, form.metadataValues),
    })
    setLoading(false)
    if (isOk(result)) {
      toast.success('Holon created')
      setOpen(false)
      setForm(DEFAULT_FORM)
      onCreated()
    } else {
      toast.error(result.error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Create Holon</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Holon</DialogTitle>
        </DialogHeader>
        <HolonForm form={form} onChange={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── EditHolonDialog ───

function EditHolonDialog({
  holon,
  onUpdated,
}: {
  holon: HolonResult
  onUpdated: () => void
}) {
  const [open, setOpen] = useState(false)
  const metaKeys = holon.metadata ? Object.keys(holon.metadata) : ['']
  const metaVals = holon.metadata ? Object.values(holon.metadata) : ['']

  const [form, setForm] = useState<HolonFormState>({
    name: holon.name ?? '',
    description: holon.description ?? '',
    providerName: holon.providerName ?? '',
    chainId: holon.chainId ?? 'algorand',
    assetType: holon.assetType ?? '',
    metadataKeys: metaKeys.length ? metaKeys : [''],
    metadataValues: metaVals.length ? metaVals : [''],
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setLoading(true)
    const result = await oasis.holons.update(holon.id, {
      name: form.name,
      description: form.description,
      providerName: form.providerName,
      chainId: form.chainId,
      assetType: form.assetType,
      metadata: buildMetadata(form.metadataKeys, form.metadataValues),
    })
    setLoading(false)
    if (isOk(result)) {
      toast.success('Holon updated')
      setOpen(false)
      onUpdated()
    } else {
      toast.error(result.error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Holon</DialogTitle>
        </DialogHeader>
        <HolonForm form={form} onChange={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── DeleteHolonDialog ───

function DeleteHolonDialog({
  holon,
  onDeleted,
}: {
  holon: HolonResult
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await oasis.holons.delete(holon.id)
    setLoading(false)
    if (isOk(result)) {
      toast.success('Holon deleted')
      setOpen(false)
      onDeleted()
    } else {
      toast.error(result.error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Holon</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{holon.name}</strong>? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── TreePanel ───

function TreePanel({ holon }: { holon: HolonResult }) {
  const [children, setChildren] = useState<HolonResult[] | null>(null)
  const [peers, setPeers] = useState<HolonResult[] | null>(null)
  const [ancestors, setAncestors] = useState<HolonResult[] | null>(null)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const load = async (type: 'children' | 'peers' | 'ancestors') => {
    setLoadingKey(type)
    try {
      let result
      if (type === 'children') result = await oasis.holons.getChildren(holon.id)
      else if (type === 'peers') result = await oasis.holons.getPeers(holon.id)
      else result = await oasis.holons.getAncestors(holon.id)

      if (isOk(result)) {
        if (type === 'children') setChildren(result.value)
        else if (type === 'peers') setPeers(result.value)
        else setAncestors(result.value)
      } else {
        toast.error(result.error.message)
      }
    } finally {
      setLoadingKey(null)
    }
  }

  const renderList = (label: string, items: HolonResult[] | null) => {
    if (!items) return null
    return (
      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">None found</p>
        ) : (
          items.map((h) => (
            <div key={h.id} className="flex items-center gap-2 text-sm">
              <ChainBadge chain={h.chainId ?? 'unknown'} />
              <span>{h.name}</span>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => load('children')}
          disabled={loadingKey === 'children'}
        >
          {loadingKey === 'children' ? 'Loading…' : 'Load Children'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load('peers')}
          disabled={loadingKey === 'peers'}
        >
          {loadingKey === 'peers' ? 'Loading…' : 'Load Peers'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load('ancestors')}
          disabled={loadingKey === 'ancestors'}
        >
          {loadingKey === 'ancestors' ? 'Loading…' : 'Load Ancestors'}
        </Button>
      </div>
      {renderList('Children', children)}
      {renderList('Peers', peers)}
      {renderList('Ancestors', ancestors)}
    </div>
  )
}

// ─── DetailPanel ───

function DetailPanel({
  holon,
  onUpdated,
  onDeleted,
}: {
  holon: HolonResult
  onUpdated: () => void
  onDeleted: () => void
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{holon.name}</CardTitle>
            <p className="mt-1 truncate text-xs text-muted-foreground">{holon.id}</p>
          </div>
          <ChainBadge chain={holon.chainId ?? 'unknown'} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tree">Tree</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <span className="font-medium text-muted-foreground">Asset Type</span>
              <span>{holon.assetType || '—'}</span>
              <span className="font-medium text-muted-foreground">Active</span>
              <span>
                <Badge variant={holon.isActive ? 'default' : 'secondary'}>
                  {holon.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </span>
              <span className="font-medium text-muted-foreground">Created</span>
              <span>
                {holon.createdDate
                  ? new Date(holon.createdDate).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Raw Data
              </p>
              <div className="rounded-md bg-muted/50 p-3 text-xs">
                <JsonViewer data={holon} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tree">
            <TreePanel holon={holon} />
          </TabsContent>

          <TabsContent value="actions">
            <div className="flex flex-wrap gap-2">
              <EditHolonDialog holon={holon} onUpdated={onUpdated} />
              <DeleteHolonDialog holon={holon} onDeleted={onDeleted} />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const result = await oasis.holons.create({
                    name: `${holon.name} (clone)`,
                    chainId: holon.chainId,
                    assetType: holon.assetType,
                    metadata: holon.metadata as Record<string, string>,
                  })
                  if (isOk(result)) {
                    toast.success('Holon cloned')
                    onUpdated()
                  } else {
                    toast.error(result.error.message)
                  }
                }}
              >
                Clone
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// ─── Main page ───

export default function HolonsPage() {
  useOasisAuth()

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [holons, setHolons] = useState<HolonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<HolonResult | null>(null)

  const search = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSelected(null)

    const queryFilters: Record<string, unknown> = {}
    if (filters.name) queryFilters.name = filters.name
    if (filters.chainId !== 'any') queryFilters.chainId = filters.chainId
    if (filters.assetType) queryFilters.assetType = filters.assetType
    if (filters.isActive !== undefined) queryFilters.isActive = filters.isActive

    const result = await oasis.holons.where(queryFilters).execute()
    setLoading(false)
    setSearched(true)

    if (isOk(result)) {
      setHolons(result.value)
    } else {
      setError(result.error.message)
    }
  }, [filters])

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setHolons([])
    setSearched(false)
    setSelected(null)
    setError(null)
  }

  const handleUpdated = () => {
    search()
    setSelected(null)
  }

  const handleDeleted = () => {
    search()
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Holon Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Query and manage holons across chains
          </p>
        </div>
        <CreateHolonDialog onCreated={search} />
      </div>

      {/* Query Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                placeholder="Search by name…"
                value={filters.name}
                onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </div>
            <div className="space-y-1">
              <Label>Chain</Label>
              <Select
                value={filters.chainId}
                onValueChange={(v: string | null) =>
                  setFilters((f) => ({ ...f, chainId: v ?? 'any' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="algorand">Algorand</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Asset Type</Label>
              <Input
                placeholder="e.g. NFT, Token…"
                value={filters.assetType}
                onChange={(e) => setFilters((f) => ({ ...f, assetType: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={filters.isActive === true}
                  onCheckedChange={(checked) =>
                    setFilters((f) => ({
                      ...f,
                      isActive: checked === true ? true : undefined,
                    }))
                  }
                />
                <Label htmlFor="isActive">Active only</Label>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={search} disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && <ErrorBanner message={error} onRetry={search} />}

      {/* Results + Detail split */}
      <div className="flex gap-6">
        {/* Table */}
        <div className="min-w-0 flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Results {searched && !loading && `(${holons.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-2 p-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !searched ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Use the filters above to search for holons.
                </p>
              ) : holons.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No holons found. Create one to get started.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Chain</TableHead>
                      <TableHead>Asset Type</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holons.map((h) => (
                      <TableRow
                        key={h.id}
                        className={`cursor-pointer ${selected?.id === h.id ? 'bg-muted' : ''}`}
                        onClick={() => setSelected(h)}
                      >
                        <TableCell className="font-medium">{h.name}</TableCell>
                        <TableCell>
                          <ChainBadge chain={h.chainId ?? 'unknown'} />
                        </TableCell>
                        <TableCell>{h.assetType || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={h.isActive ? 'default' : 'secondary'}>
                            {h.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {h.createdDate
                            ? new Date(h.createdDate).toLocaleDateString()
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-96 shrink-0">
            <DetailPanel
              holon={selected}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          </div>
        )}
      </div>
    </div>
  )
}
