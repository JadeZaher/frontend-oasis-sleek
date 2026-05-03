'use client'

import { useState, useEffect } from 'react'
import { apiClient, BlockchainResponse } from '@/lib/api'

interface TestResult {
  id: string
  testName: string
  status: 'pending' | 'running' | 'success' | 'failed'
  duration: number
  message: string
  timestamp: Date
  details?: any
}

interface TestInterfaceProps {
  selectedChain: string
}

export function TestInterface({ selectedChain }: TestInterfaceProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [testAddress, setTestAddress] = useState('')
  const [testAmount, setTestAmount] = useState('')
  const [testTokenId, setTestTokenId] = useState('')

  const sampleAddress = selectedChain === 'algorand' 
    ? '7J6ZZGF2UPNKKBCJA4DHFKVL6LXGKKDQM6KX4YZ5J5H5F7ZJGX6W4PUJJY'
    : 'So11111111111111111111111111111111111111112'

  useEffect(() => {
    setTestAddress(sampleAddress)
  }, [selectedChain])

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    const testId = Date.now().toString()
    const startTime = Date.now()
    
    const testResult: TestResult = {
      id: testId,
      testName,
      status: 'running',
      duration: 0,
      message: 'Running...',
      timestamp: new Date()
    }
    
    setTestResults(prev => [testResult, ...prev])
    
    try {
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      const updatedResult: TestResult = {
        ...testResult,
        status: result.success ? 'success' : 'failed',
        duration,
        message: result.message || 'Test completed',
        details: result
      }
      
      setTestResults(prev => prev.map(t => t.id === testId ? updatedResult : t))
    } catch (error) {
      const duration = Date.now() - startTime
      
      const updatedResult: TestResult = {
        ...testResult,
        status: 'failed',
        duration,
        message: error instanceof Error ? error.message : 'Test failed',
        details: error
      }
      
      setTestResults(prev => prev.map(t => t.id === testId ? updatedResult : t))
    }
  }

  const testAddressValidation = async () => {
    await runTest('Address Validation', async () => {
      const response: BlockchainResponse = await apiClient.validateAddress({
        address: testAddress
      })
      
      if (response.success) {
        return {
          success: true,
          message: `Address is ${response.result?.exists ? 'valid and exists' : 'valid format but may not exist'}`,
          result: response.result
        }
      } else {
        throw new Error(response.error || 'Address validation failed')
      }
    })
  }

  const testBalanceRetrieval = async () => {
    await runTest('Balance Retrieval', async () => {
      const response: BlockchainResponse = await apiClient.getBalance({
        address: testAddress,
        tokenId: testTokenId || undefined
      })
      
      if (response.success) {
        return {
          success: true,
          message: `Balance retrieved: ${response.result?.balance}`,
          result: response.result
        }
      } else {
        throw new Error(response.error || 'Balance retrieval failed')
      }
    })
  }

  const testTransactionStatus = async () => {
    await runTest('Transaction Status', async () => {
      // Use a sample transaction hash for testing
      const sampleHash = selectedChain === 'algorand' 
        ? 'TX1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        : '5sGd7f6gNFt1v61j4GH1k18F6j2s8gF7p6d9f3a2b1c4e5f6a7b8c9d0e1f2a3b'
      
      const response: BlockchainResponse = await apiClient.getTransactionStatus({
        txHash: sampleHash
      })
      
      if (response.success) {
        return {
          success: true,
          message: `Transaction status: ${response.result?.status}`,
          result: response.result
        }
      } else {
        throw new Error(response.error || 'Transaction status check failed')
      }
    })
  }

  const testTokenMetadata = async () => {
    await runTest('Token Metadata', async () => {
      const sampleTokenId = selectedChain === 'algorand' ? '123456789' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      
      const response: BlockchainResponse = await apiClient.getTokenMetadata({
        tokenId: sampleTokenId
      })
      
      if (response.success) {
        return {
          success: true,
          message: `Token metadata retrieved: ${response.result?.name || 'Unknown'}`,
          result: response.result
        }
      } else {
        throw new Error(response.error || 'Token metadata retrieval failed')
      }
    })
  }

  const testAllFunctions = async () => {
    setIsRunning(true)
    const tests = [
      testAddressValidation,
      testBalanceRetrieval,
      testTransactionStatus,
      testTokenMetadata
    ]
    
    for (const test of tests) {
      await test()
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setIsRunning(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'running':
        return 'text-blue-600 bg-blue-50'
      case 'pending':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Testing Interface</h3>
          <button 
            onClick={testAllFunctions}
            disabled={isRunning}
            className="blockchain-button disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        {/* Test Configuration */}
        <div className="blockchain-card mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Test Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Address
              </label>
              <input
                type="text"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                className="blockchain-input w-full"
                placeholder="Enter test address..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token ID (Optional)
              </label>
              <input
                type="text"
                value={testTokenId}
                onChange={(e) => setTestTokenId(e.target.value)}
                className="blockchain-input w-full"
                placeholder="Enter token ID..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Amount
              </label>
              <input
                type="text"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="blockchain-input w-full"
                placeholder="Enter amount..."
              />
            </div>
          </div>
        </div>

        {/* Individual Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button 
            onClick={testAddressValidation}
            disabled={isRunning}
            className="blockchain-button disabled:opacity-50"
          >
            Test Address Validation
          </button>
          <button 
            onClick={testBalanceRetrieval}
            disabled={isRunning}
            className="blockchain-button disabled:opacity-50"
          >
            Test Balance Retrieval
          </button>
          <button 
            onClick={testTransactionStatus}
            disabled={isRunning}
            className="blockchain-button disabled:opacity-50"
          >
            Test Transaction Status
          </button>
          <button 
            onClick={testTokenMetadata}
            disabled={isRunning}
            className="blockchain-button disabled:opacity-50"
          >
            Test Token Metadata
          </button>
        </div>

        {/* Test Results */}
        <div className="blockchain-card">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Test Results</h4>
          
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No test results yet. Run a test to see results.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result) => (
                <div 
                  key={result.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTest === result.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTest(selectedTest === result.id ? null : result.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(result.status).replace('text-', 'bg-').replace('bg-', 'bg-')}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{result.testName}</p>
                        <p className="text-sm text-gray-500">{result.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDuration(result.duration)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedTest === result.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Details:</p>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Statistics */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="blockchain-card text-center">
              <p className="text-2xl font-bold text-gray-900">{testResults.length}</p>
              <p className="text-sm text-gray-500">Total Tests</p>
            </div>
            <div className="blockchain-card text-center">
              <p className="text-2xl font-bold text-green-600">
                {testResults.filter(t => t.status === 'success').length}
              </p>
              <p className="text-sm text-gray-500">Passed</p>
            </div>
            <div className="blockchain-card text-center">
              <p className="text-2xl font-bold text-red-600">
                {testResults.filter(t => t.status === 'failed').length}
              </p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
            <div className="blockchain-card text-center">
              <p className="text-2xl font-bold text-blue-600">
                {testResults.filter(t => t.status === 'running').length}
              </p>
              <p className="text-sm text-gray-500">Running</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}