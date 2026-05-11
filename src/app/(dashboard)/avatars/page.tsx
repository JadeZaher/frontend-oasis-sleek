'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useOasis } from '@/lib/oasis-context'
import { oasis, isOk, isErr } from '@/lib/oasis'
import { ResultDisplay } from '@/components/shared/result-display'
import { JsonViewer } from '@/components/shared/json-viewer'

type ProfileFields = {
  username: string
  email: string
  firstName: string
  lastName: string
  title: string
}

export default function AvatarsPage() {
  const { user, avatarId, logout, refreshProfile } = useOasis()

  const [form, setForm] = useState<ProfileFields>({
    username: user?.username ?? '',
    email: user?.email ?? '',
    firstName: (user as Record<string, unknown> | null)?.firstName as string ?? '',
    lastName: (user as Record<string, unknown> | null)?.lastName as string ?? '',
    title: (user as Record<string, unknown> | null)?.title as string ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ ok: boolean; data?: unknown; message?: string } | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [jsonOpen, setJsonOpen] = useState(false)

  const handleChange = (field: keyof ProfileFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    if (!avatarId) return
    setSaving(true)
    setSaveResult(null)
    try {
      const result = await oasis.api.updateAvatar(avatarId, form)
      if (isOk(result)) {
        await refreshProfile()
        setSaveResult({ ok: true, data: result.value, message: 'Profile updated successfully.' })
      } else {
        setSaveResult({ ok: false, message: result.error.message })
      }
    } catch (err) {
      setSaveResult({ ok: false, message: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    await logout()
    setDeleting(false)
    setDeleteOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Avatar Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your OASIS avatar identity</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Information</CardTitle>
          <CardDescription>Update your avatar&apos;s details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={handleChange('username')}
                placeholder="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={handleChange('firstName')}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={handleChange('lastName')}
                placeholder="Last name"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="e.g. Guardian of the OASIS"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving || !avatarId}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {saveResult && (
            <ResultDisplay
              result={saveResult.data}
              isError={!saveResult.ok}
              message={saveResult.message}
            />
          )}
        </CardContent>
      </Card>

      {/* Raw Profile JSON */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Raw Profile Data</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setJsonOpen(v => !v)}
            >
              {jsonOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {jsonOpen && (
          <CardContent>
            <div className="rounded-md bg-muted p-3 text-sm font-mono">
              <JsonViewer data={user} />
            </div>
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger render={<Button variant="destructive">Delete Account</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure? Your avatar and all associated data will be permanently removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
