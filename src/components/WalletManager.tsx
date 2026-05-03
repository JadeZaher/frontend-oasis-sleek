'use client'

import { useState, useEffect } from 'react'
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

  const sampleAddresses = {
    algorand: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
    solana: 'So11111111111111111111111111111111111111112'
  }

  useEffect(() => {
    loadSampleWallet()
  }, [selectedChain])

  const loadSampleWallet = async () => {
    const address = sampleAddresses[selectedChain as keyof typeof sampleAddresses]
    if (address) {
      await fetchWalletInfo(address)
    }
  }

  const fetchWalletInfo = async (address: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch balance
      const balanceResponse: BlockchainResponse = await apiClient.getBalance({
        address,
        tokenId: selectedChain === 'solana' ? 'SOL' : undefined
      })
      
      let balance = '0'
      if (balanceResponse.success && balanceResponse.result) {
        balance = balanceResponse.result.balance || '0'
      }
      
      // Fetch tokens
      let tokens = []
      if (selectedChain === 'solana') {
        const tokensResponse: BlockchainResponse = await apiClient.getTokensByOwner({ address })
        if (tokensResponse.success && tokensResponse.result) {
          tokens = tokensResponse.result.map((token: any) => ({
            address: token.address,
            balance: token.balance,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals
          }))
        }
      }
      
      setWalletInfo({
        address,
        balance,
        tokens,
        isConnected: true
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const formatBalance = (balance: string, decimals: number = 6) => {
    const num = parseFloat(balance)
    if (isNaN(num)) return '0'
    return num.toFixed(decimals)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Wallet Manager</h3>
          <button 
            onClick={() => setShowConnectDialog(true)}
            className="blockchain-button"
          >
            Connect Wallet
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="blockchain-loading"></div>
            <span className="ml-2 text-sm text-gray-500">Loading wallet...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : walletInfo ? (
          <div className="space-y-6">
            {/* Wallet Overview */}
            <div className="blockchain-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-900">Wallet Overview</h4>
                  <p className="text-sm text-gray-500">{formatAddress(walletInfo.address)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium wallet-connected`}>
                  Connected
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Native Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatBalance(walletInfo.balance)} {selectedChain === 'algorand' ? 'ALGO' : 'SOL'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Token Count</p>
                  <p className="text-2xl font-bold text-gray-900">{walletInfo.tokens.length}</p>
                </div>
              </div>
            </div>

            {/* Token Holdings */}
            <div className="blockchain-card">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Token Holdings</h4>
              
              {walletInfo.tokens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tokens found</p>
                  <button className="mt-2 blockchain-button-secondary text-sm">
                    Import Tokens
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {walletInfo.tokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {token.symbol?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{token.symbol || 'Unknown Token'}</p>
                          <p className="text-sm text-gray-500">{token.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatBalance(token.balance, token.decimals)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {token.symbol || 'Tokens'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="blockchain-button">
                Send {selectedChain === 'algorand' ? 'ALGO' : 'SOL'}
              </button>
              <button className="blockchain-button-secondary">
                Receive {selectedChain === 'algorand' ? 'ALGO' : 'SOL'}
              </button>
              <button className="blockchain-button-secondary">
                View History
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Connect Dialog */}
      {showConnectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Wallet</h3>
            <form onSubmit={handleAddressSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder={`Enter ${selectedChain} address...`}
                  className="blockchain-input w-full"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="blockchain-button flex-1">
                  Connect
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowConnectDialog(false)}
                  className="blockchain-button-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}