'use client'

import { useState, useEffect } from 'react'
import { apiClient, BlockchainResponse } from '@/lib/api'

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

export function AvatarNFTDashboard({ selectedChain }: AvatarNFTDashboardProps) {
  const [avatars, setAvatars] = useState<AvatarNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarNFT | null>(null)

  // Sample avatars for demonstration
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
        { trait_type: 'Element', value: 'Cosmic' }
      ]
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
        { trait_type: 'Element', value: 'Digital' }
      ]
    }
  ]

  useEffect(() => {
    loadAvatars()
  }, [selectedChain])

  const loadAvatars = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // For demo purposes, we'll use sample avatars
      // In a real implementation, you would fetch from your backend
      setAvatars(sampleAvatars)
    } catch (err) {
      setError('Failed to load avatars')
      setAvatars([])
    } finally {
      setIsLoading(false)
    }
  }

  const createAvatar = async (avatarData: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate avatar creation
      const newAvatar: AvatarNFT = {
        id: Date.now().toString(),
        name: avatarData.name,
        description: avatarData.description,
        imageUrl: avatarData.imageUrl || 'https://via.placeholder.com/150',
        ownerAddress: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
        tokenId: Math.floor(Math.random() * 1000000000).toString(),
        chainType: selectedChain,
        mintDate: new Date(),
        attributes: avatarData.attributes || []
      }
      
      setAvatars(prev => [newAvatar, ...prev])
      setShowCreateModal(false)
    } catch (err) {
      setError('Failed to create avatar')
    } finally {
      setIsLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'text-yellow-600 bg-yellow-50'
      case 'epic':
        return 'text-purple-600 bg-purple-50'
      case 'rare':
        return 'text-blue-600 bg-blue-50'
      case 'common':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Avatar NFT Dashboard</h3>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="blockchain-button"
          >
            Create Avatar
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="blockchain-loading"></div>
            <span className="ml-2 text-sm text-gray-500">Loading avatars...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-gray-900">{avatars.length}</p>
                <p className="text-sm text-gray-500">Total Avatars</p>
              </div>
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {avatars.filter(a => a.attributes.some(attr => attr.value.toLowerCase().includes('legendary'))).length}
                </p>
                <p className="text-sm text-gray-500">Legendary</p>
              </div>
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {avatars.filter(a => a.attributes.some(attr => attr.value.toLowerCase().includes('epic'))).length}
                </p>
                <p className="text-sm text-gray-500">Epic</p>
              </div>
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {avatars.reduce((acc, a) => acc + (a.attributes.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Traits</p>
              </div>
            </div>

            {/* Avatar Grid */}
            <div className="blockchain-card">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Your Avatar Collection</h4>
              
              {avatars.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No avatars created yet</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 blockchain-button"
                  >
                    Create Your First Avatar
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {avatars.map((avatar) => (
                    <div 
                      key={avatar.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <img 
                          src={avatar.imageUrl} 
                          alt={avatar.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{avatar.name}</h5>
                          <p className="text-sm text-gray-500">Token ID: {avatar.tokenId}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRarityColor(
                            avatar.attributes.find(attr => attr.trait_type === 'Rarity')?.value || 'Common'
                          )}`}>
                            {avatar.attributes.find(attr => attr.trait_type === 'Rarity')?.value || 'Common'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{avatar.description}</p>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500">Attributes:</p>
                        <div className="flex flex-wrap gap-2">
                          {avatar.attributes.map((attr, index) => (
                            <span 
                              key={index} 
                              className="blockchain-tag text-xs"
                            >
                              {attr.trait_type}: {attr.value}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Minted: {avatar.mintDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Chain: {avatar.chainType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Avatar Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Avatar</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              createAvatar(Object.fromEntries(formData))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="blockchain-input w-full"
                    placeholder="Enter avatar name..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="blockchain-input w-full"
                    placeholder="Describe your avatar..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    className="blockchain-input w-full"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attributes (JSON format)
                  </label>
                  <textarea
                    name="attributes"
                    rows={4}
                    className="blockchain-input w-full"
                    placeholder='[{"trait_type": "Rarity", "value": "Legendary"}]'
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="blockchain-button flex-1">
                  Create Avatar
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="blockchain-button-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Detail Modal */}
      {selectedAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedAvatar.name}</h3>
              <button 
                onClick={() => setSelectedAvatar(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedAvatar.imageUrl} 
                  alt={selectedAvatar.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedAvatar.name}</h4>
                  <p className="text-gray-600">{selectedAvatar.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Token ID: {selectedAvatar.tokenId}
                  </p>
                </div>
              </div>
              
              <div className="blockchain-card">
                <h5 className="font-semibold text-gray-900 mb-3">Attributes</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedAvatar.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{attr.trait_type}</span>
                      <span className="blockchain-tag">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="blockchain-card">
                  <h5 className="font-semibold text-gray-900 mb-2">Details</h5>
                  <p className="text-sm text-gray-600">
                    <strong>Chain:</strong> {selectedAvatar.chainType}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Minted:</strong> {selectedAvatar.mintDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Owner:</strong> {selectedAvatar.ownerAddress.slice(0, 8)}...{selectedAvatar.ownerAddress.slice(-8)}
                  </p>
                </div>
                
                <div className="blockchain-card">
                  <h5 className="font-semibold text-gray-900 mb-2">Actions</h5>
                  <div className="space-y-2">
                    <button className="blockchain-button w-full">
                      View on Explorer
                    </button>
                    <button className="blockchain-button-secondary w-full">
                      Transfer Avatar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}