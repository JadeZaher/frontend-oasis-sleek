'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface AvatarNFT {
  id: string
  name: string
  description: string
  imageUrl: string
  ownerAddress: string
  tokenId: string
  chainType: string
  mintDate: Date
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

interface AvatarNFTDashboardProps {
  selectedChain: string
}

const sampleAvatars: AvatarNFT[] = [
  {
    id: '1',
    name: 'Cosmic Warrior',
    description: 'A brave warrior from the cosmic realm',
    imageUrl: 'https://via.placeholder.com/150',
    ownerAddress: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
    tokenId: '123456789',
    chainType: 'algorand',
    mintDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    attributes: [
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Power', value: '95' },
      { trait_type: 'Element', value: 'Cosmic' },
    ],
  },
  {
    id: '2',
    name: 'Digital Sage',
    description: 'A wise digital entity with ancient knowledge',
    imageUrl: 'https://via.placeholder.com/150',
    ownerAddress: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
    tokenId: '987654321',
    chainType: 'algorand',
    mintDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    attributes: [
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Wisdom', value: '88' },
      { trait_type: 'Element', value: 'Digital' },
    ],
  },
]

function rarityBadgeClass(rarity: string) {
  switch (rarity.toLowerCase()) {
    case 'legendary':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'epic':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'rare':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function AvatarNFTDashboard({ selectedChain }: AvatarNFTDashboardProps) {
  const [avatars, setAvatars] = useState<AvatarNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarNFT | null>(null)

  useEffect(() => {
    loadAvatars()
  }, [selectedChain])

  const loadAvatars = () => {
    try {
      setIsLoading(true)
      setError(null)
      setAvatars(sampleAvatars)
    } catch (err) {
      setError('Failed to load avatars')
      setAvatars([])
    } finally {
      setIsLoading(false)
    }
  }

  const createAvatar = (avatarData: any) => {
    try {
      setIsLoading(true)
      setError(null)

      const newAvatar: AvatarNFT = {
        id: Date.now().toString(),
        name: avatarData.name,
        description: avatarData.description || '',
        imageUrl: avatarData.imageUrl || 'https://via.placeholder.com/150',
        ownerAddress: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
        tokenId: Math.floor(Math.random() * 1000000000).toString(),
        chainType: selectedChain,
        mintDate: new Date(),
        attributes: avatarData.attributes || [],
      }

      setAvatars((prev) => [newAvatar, ...prev])
      setShowCreateDialog(false)
    } catch (err) {
      setError('Failed to create avatar')
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-8)}`

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Avatar NFT Dashboard</h3>
          <Button onClick={() => setShowCreateDialog(true)}>Create Avatar</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading avatars...</span>
          </div>
        ) : error ? (
          <Card className="border-destructive/40">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{avatars.length}</p>
                  <p className="text-sm text-muted-foreground">Total Avatars</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {avatars.filter((a) =>
                      a.attributes.some((attr) => attr.value.toLowerCase().includes('legendary'))
                    ).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Legendary</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {avatars.filter((a) =>
                      a.attributes.some((attr) => attr.value.toLowerCase().includes('epic'))
                    ).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Epic</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">
                    {avatars.reduce((acc, a) => acc + (a.attributes.length || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Traits</p>
                </CardContent>
              </Card>
            </div>

            {/* Avatar Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your Avatar Collection</CardTitle>
              </CardHeader>
              <CardContent>
                {avatars.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-muted-foreground">No avatars created yet</p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      Create Your First Avatar
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {avatars.map((avatar) => (
                      <Card
                        key={avatar.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedAvatar(avatar)}
                      >
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={avatar.imageUrl}
                              alt={avatar.name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm truncate">{avatar.name}</h5>
                              <p className="text-xs text-muted-foreground">
                                Token ID: {avatar.tokenId}
                              </p>
                              <Badge
                                className={`mt-1 text-xs ${rarityBadgeClass(
                                  avatar.attributes.find((attr) => attr.trait_type === 'Rarity')
                                    ?.value || 'Common'
                                )}`}
                              >
                                {avatar.attributes.find(
                                  (attr) => attr.trait_type === 'Rarity'
                                )?.value || 'Common'}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {avatar.description}
                          </p>

                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Attributes:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {avatar.attributes.map((attr, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {attr.trait_type}: {attr.value}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground">
                              Minted: {avatar.mintDate.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Chain: {avatar.chainType}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Avatar Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Avatar</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const data: Record<string, unknown> = {}
              formData.forEach((value, key) => {
                data[key] = value
              })
              createAvatar(data)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="av-name">Avatar Name</Label>
              <Input id="av-name" name="name" placeholder="Enter avatar name..." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="av-desc">Description</Label>
              <Textarea
                id="av-desc"
                name="description"
                rows={3}
                placeholder="Describe your avatar..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="av-image">Image URL (Optional)</Label>
              <Input
                id="av-image"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="av-attrs">Attributes (JSON format)</Label>
              <Textarea
                id="av-attrs"
                name="attributes"
                rows={4}
                placeholder='[{"trait_type": "Rarity", "value": "Legendary"}]'
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Create Avatar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Avatar Detail Dialog */}
      <Dialog open={!!selectedAvatar} onOpenChange={(open) => { if (!open) setSelectedAvatar(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAvatar?.name}</DialogTitle>
          </DialogHeader>

          {selectedAvatar && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedAvatar.imageUrl}
                  alt={selectedAvatar.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xl font-semibold">{selectedAvatar.name}</h4>
                  <p className="text-muted-foreground">{selectedAvatar.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Token ID: {selectedAvatar.tokenId}
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAvatar.attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center rounded-lg border p-3"
                      >
                        <span className="font-medium text-sm">{attr.trait_type}</span>
                        <Badge variant="secondary">{attr.value}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>
                      <strong>Chain:</strong> {selectedAvatar.chainType}
                    </p>
                    <p>
                      <strong>Minted:</strong> {selectedAvatar.mintDate.toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Owner:</strong> {formatAddress(selectedAvatar.ownerAddress)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm">
                      View on Explorer
                    </Button>
                    <Button variant="secondary" className="w-full" size="sm">
                      Transfer Avatar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
