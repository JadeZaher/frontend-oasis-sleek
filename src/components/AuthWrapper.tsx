'use client'

import { useAuth } from '@/lib/auth-simple'
import { BlockchainDashboard } from './BlockchainDashboard'
import { WalletManager } from './WalletManager'
import { TransactionHistory } from './TransactionHistory'
import { TestInterface } from './TestInterface'
import { AvatarNFTDashboard } from './AvatarNFTDashboard'
import { AuthModal } from '@/lib/auth-simple'

interface AuthWrapperProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedChain: string
  setSelectedChain: (chain: string) => void
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  onAuthSuccess: () => void
}

export function AuthWrapper({ 
  activeTab, 
  setActiveTab, 
  selectedChain, 
  setSelectedChain, 
  showAuthModal, 
  setShowAuthModal, 
  onAuthSuccess 
}: AuthWrapperProps) {
  const { isAuthenticated, user, loading } = useAuth()

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'wallets', name: 'Wallets', icon: '💳' },
    { id: 'avatar-nfts', name: 'Avatar NFTs', icon: '🎨' },
    { id: 'transactions', name: 'Transactions', icon: '📝' },
    { id: 'testing', name: 'Testing', icon: '🧪' },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="blockchain-loading"></div>
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Auth */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">OASIS Sleek</h2>
          <p className="text-sm text-gray-500">Avatar NFT & Blockchain Platform</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="blockchain-button"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Chain Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Network Configuration</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Network:</span>
            <select 
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="blockchain-input"
            >
              <option value="algorand">Algorand Devnet</option>
              <option value="solana">Solana Devnet</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔗</div>
              <h4 className="text-lg font-semibold text-gray-900">Real Connectivity</h4>
              <p className="text-sm text-gray-500">Test with actual blockchain devnet</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="text-lg font-semibold text-gray-900">Live Transactions</h4>
              <p className="text-sm text-gray-500">Monitor transaction status in real-time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="text-lg font-semibold text-gray-900">Error Handling</h4>
              <p className="text-sm text-gray-500">Robust error handling and retry logic</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="text-lg font-semibold text-gray-900">Avatar NFTs</h4>
              <p className="text-sm text-gray-500">Digital identity with holon integration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {activeTab === 'dashboard' && <BlockchainDashboard selectedChain={selectedChain} />}
        {activeTab === 'wallets' && <WalletManager selectedChain={selectedChain} />}
        {activeTab === 'avatar-nfts' && (
          <AvatarNFTDashboard selectedChain={selectedChain} />
        )}
        {activeTab === 'transactions' && <TransactionHistory selectedChain={selectedChain} />}
        {activeTab === 'testing' && <TestInterface selectedChain={selectedChain} />}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  )
}