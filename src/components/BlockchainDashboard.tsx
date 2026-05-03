'use client'

import { useState, useEffect } from 'react'
import { apiClient, BlockchainResponse } from '@/lib/api'

interface BlockchainInfo {
  chain: string
  network: string
  nodeVersion?: string
  genesisHash?: string
  round?: string
  time?: string
  apiVersion?: string
  totalSupply?: string
  circulatingSupply?: string
}

interface BlockchainDashboardProps {
  selectedChain: string
}

export function BlockchainDashboard({ selectedChain }: BlockchainDashboardProps) {
  const [chainInfo, setChainInfo] = useState<BlockchainInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChainInfo()
  }, [selectedChain])

  const fetchChainInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response: BlockchainResponse<BlockchainInfo> = await apiClient.getChainInfo(selectedChain)
      
      if (response.success && response.result) {
        setChainInfo(response.result)
      } else {
        setError(response.error || 'Failed to fetch chain info')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} Network Status
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="blockchain-loading"></div>
            <span className="ml-2 text-sm text-gray-500">Loading network information...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={fetchChainInfo}
              className="mt-2 blockchain-button-destructive text-xs"
            >
              Retry
            </button>
          </div>
        ) : chainInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="blockchain-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Chain</p>
                  <p className="text-lg font-semibold text-gray-900">{chainInfo.chain}</p>
                </div>
                <div className="text-2xl">🔗</div>
              </div>
            </div>
            
            <div className="blockchain-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Network</p>
                  <p className="text-lg font-semibold text-gray-900">{chainInfo.network}</p>
                </div>
                <div className="text-2xl">🌐</div>
              </div>
            </div>
            
            <div className="blockchain-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">API Version</p>
                  <p className="text-lg font-semibold text-gray-900">{chainInfo.apiVersion || 'N/A'}</p>
                </div>
                <div className="text-2xl">⚙️</div>
              </div>
            </div>
            
            {chainInfo.round && (
              <div className="blockchain-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Round</p>
                    <p className="text-lg font-semibold text-gray-900">{chainInfo.round}</p>
                  </div>
                  <div className="text-2xl">🔢</div>
                </div>
              </div>
            )}
            
            {chainInfo.totalSupply && (
              <div className="blockchain-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Supply</p>
                    <p className="text-lg font-semibold text-gray-900">{chainInfo.totalSupply}</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
            )}
            
            {chainInfo.circulatingSupply && (
              <div className="blockchain-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Circulating Supply</p>
                    <p className="text-lg font-semibold text-gray-900">{chainInfo.circulatingSupply}</p>
                  </div>
                  <div className="text-2xl">🪙</div>
                </div>
              </div>
            )}
            
            <div className="blockchain-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {chainInfo.time ? new Date(chainInfo.time).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="text-2xl">⏰</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="blockchain-card">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full blockchain-button text-sm">
              Check Balance
            </button>
            <button className="w-full blockchain-button-secondary text-sm">
              Validate Address
            </button>
            <button className="w-full blockchain-button-secondary text-sm">
              View Transactions
            </button>
          </div>
        </div>
        
        <div className="blockchain-card">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Provider Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('confirmed')}`}>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-900">~250ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}