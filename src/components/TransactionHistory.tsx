'use client'

import { useState, useEffect } from 'react'
import { apiClient, BlockchainResponse } from '@/lib/api'

interface Transaction {
  id: string
  hash: string
  type: 'transfer' | 'mint' | 'burn' | 'create_asa' | 'opt_in'
  status: 'pending' | 'confirmed' | 'failed'
  from?: string
  to?: string
  amount?: string
  tokenId?: string
  timestamp: Date
  fee?: string
  block?: string
}

interface TransactionHistoryProps {
  selectedChain: string
}

export function TransactionHistory({ selectedChain }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  // Sample transactions for demonstration
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      hash: 'TX1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      type: 'transfer',
      status: 'confirmed',
      from: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
      to: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
      amount: '1.5',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      fee: '0.001',
      block: '12345678'
    },
    {
      id: '2',
      hash: 'TX0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
      type: 'create_asa',
      status: 'confirmed',
      from: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
      amount: '1000',
      tokenId: '123456789',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      fee: '0.005',
      block: '12345670'
    },
    {
      id: '3',
      hash: 'TX5555555555555555555555555555555555555555555555555555555555555555',
      type: 'transfer',
      status: 'pending',
      from: '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY',
      to: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
      amount: '0.5',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      fee: '0.001'
    }
  ]

  useEffect(() => {
    loadTransactions()
  }, [selectedChain])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // For demo purposes, we'll use sample transactions
      // In a real implementation, you would fetch from your backend
      setTransactions(sampleTransactions)
    } catch (err) {
      setError('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'transaction-status-success'
      case 'pending':
        return 'transaction-status-pending'
      case 'failed':
        return 'transaction-status-failed'
      default:
        return 'transaction-status-pending'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return '💸'
      case 'mint':
        return '🎨'
      case 'burn':
        return '🔥'
      case 'create_asa':
        return '✨'
      case 'opt_in':
        return '📝'
      default:
        return '📝'
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 12)}...${hash.slice(-12)}`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <button 
            onClick={loadTransactions}
            className="blockchain-button-secondary"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="blockchain-loading"></div>
            <span className="ml-2 text-sm text-gray-500">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                <p className="text-sm text-gray-500">Total Transactions</p>
              </div>
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'confirmed').length}
                </p>
                <p className="text-sm text-gray-500">Confirmed</p>
              </div>
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
              <div className="blockchain-card text-center">
                <p className="text-2xl font-bold text-red-600">
                  {transactions.filter(t => t.status === 'failed').length}
                </p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
            </div>

            {/* Transaction List */}
            <div className="blockchain-card">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Transactions</h4>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">{getTypeIcon(tx.type)}</div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                            <p className="text-sm text-gray-500">{formatHash(tx.hash)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {tx.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {tx.from && tx.to && (
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            From: {formatAddress(tx.from)}
                          </span>
                          <span className="text-gray-600">
                            To: {formatAddress(tx.to)}
                          </span>
                        </div>
                      )}
                      
                      {tx.amount && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-900">
                            {tx.amount} {tx.tokenId ? `Token ${tx.tokenId.slice(0, 8)}...` : selectedChain === 'algorand' ? 'ALGO' : 'SOL'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="blockchain-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hash</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedTx.hash}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTx.status)}`}>
                      {selectedTx.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedTx.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Timestamp</p>
                    <p className="text-sm text-gray-900">{selectedTx.timestamp.toLocaleString()}</p>
                  </div>
                  {selectedTx.from && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">From</p>
                      <p className="text-sm font-mono text-gray-900">{selectedTx.from}</p>
                    </div>
                  )}
                  {selectedTx.to && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">To</p>
                      <p className="text-sm font-mono text-gray-900">{selectedTx.to}</p>
                    </div>
                  )}
                  {selectedTx.amount && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-sm text-gray-900">{selectedTx.amount}</p>
                    </div>
                  )}
                  {selectedTx.fee && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fee</p>
                      <p className="text-sm text-gray-900">{selectedTx.fee}</p>
                    </div>
                  )}
                  {selectedTx.block && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Block</p>
                      <p className="text-sm text-gray-900">{selectedTx.block}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="blockchain-button">
                  View on Explorer
                </button>
                <button className="blockchain-button-secondary">
                  Copy Hash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}