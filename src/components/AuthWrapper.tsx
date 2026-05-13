'use client'

import { useAuth } from '@/lib/auth-simple'
import { AuthModal } from '@/lib/auth-simple'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BlockchainDashboard } from './BlockchainDashboard'
import { WalletManager } from './WalletManager'
import { TransactionHistory } from './TransactionHistory'
import { TestInterface } from './TestInterface'
import { AvatarNFTDashboard } from './AvatarNFTDashboard'

interface AuthWrapperProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedChain: string
  setSelectedChain: (chain: string) => void
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  onAuthSuccess: () => void
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'wallets', label: 'Wallets', icon: '💳' },
  { id: 'avatar-nfts', label: 'Avatar NFTs', icon: '🎨' },
  { id: 'transactions', label: 'Transactions', icon: '📝' },
  { id: 'testing', label: 'Testing', icon: '🧪' },
]

export function AuthWrapper({
  activeTab,
  setActiveTab,
  selectedChain,
  setSelectedChain,
  showAuthModal,
  setShowAuthModal,
  onAuthSuccess,
}: AuthWrapperProps) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64 gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Auth */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">OASIS Sleek</h2>
          <p className="text-sm text-muted-foreground">Avatar NFT &amp; Blockchain Platform</p>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAuthModal(true)}>Sign In / Sign Up</Button>
          )}
        </div>
      </div>

      {/* Chain Selection */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Network Configuration</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Network:</span>
              <Select value={selectedChain} onValueChange={(v) => { if (v) setSelectedChain(v) }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algorand">Algorand Devnet</SelectItem>
                  <SelectItem value="solana">Solana Devnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔗</div>
              <h4 className="text-sm font-semibold">Real Connectivity</h4>
              <p className="text-xs text-muted-foreground">Test with actual blockchain devnet</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="text-sm font-semibold">Live Transactions</h4>
              <p className="text-xs text-muted-foreground">Monitor transaction status in real-time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="text-sm font-semibold">Error Handling</h4>
              <p className="text-xs text-muted-foreground">Robust error handling and retry logic</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="text-sm font-semibold">Avatar NFTs</h4>
              <p className="text-xs text-muted-foreground">Digital identity with holon integration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-0">
          {activeTab === 'dashboard' && <BlockchainDashboard selectedChain={selectedChain} />}
          {activeTab === 'wallets' && <WalletManager selectedChain={selectedChain} />}
          {activeTab === 'avatar-nfts' && <AvatarNFTDashboard selectedChain={selectedChain} />}
          {activeTab === 'transactions' && <TransactionHistory selectedChain={selectedChain} />}
          {activeTab === 'testing' && <TestInterface selectedChain={selectedChain} />}
        </CardContent>
      </Card>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  )
}
