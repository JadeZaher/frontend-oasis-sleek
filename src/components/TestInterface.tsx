'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

  const sampleAddress =
    selectedChain === 'algorand'
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
      timestamp: new Date(),
    }

    setTestResults((prev) => [testResult, ...prev])

    try {
      const result = await testFunction()
      const duration = Date.now() - startTime

      const updatedResult: TestResult = {
        ...testResult,
        status: result.success ? 'success' : 'failed',
        duration,
        message: result.message || 'Test completed',
        details: result,
      }

      setTestResults((prev) => prev.map((t) => (t.id === testId ? updatedResult : t)))
    } catch (error) {
      const duration = Date.now() - startTime

      const updatedResult: TestResult = {
        ...testResult,
        status: 'failed',
        duration,
        message: error instanceof Error ? error.message : 'Test failed',
        details: error,
      }

      setTestResults((prev) => prev.map((t) => (t.id === testId ? updatedResult : t)))
    }
  }

  const testAddressValidation = async () => {
    await runTest('Address Validation', async () => {
      const response: BlockchainResponse = await apiClient.validateAddress({
        address: testAddress,
      })

      if (response.success) {
        return {
          success: true,
          message: `Address is ${response.result?.exists ? 'valid and exists' : 'valid format but may not exist'}`,
          result: response.result,
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
        tokenId: testTokenId || undefined,
      })

      if (response.success) {
        return {
          success: true,
          message: `Balance retrieved: ${response.result?.balance}`,
          result: response.result,
        }
      } else {
        throw new Error(response.error || 'Balance retrieval failed')
      }
    })
  }

  const testTransactionStatus = async () => {
    await runTest('Transaction Status', async () => {
      const sampleHash =
        selectedChain === 'algorand'
          ? 'TX1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
          : '5sGd7f6gNFt1v61j4GH1k18F6j2s8gF7p6d9f3a2b1c4e5f6a7b8c9d0e1f2a3b'

      const response: BlockchainResponse = await apiClient.getTransactionStatus({
        txHash: sampleHash,
      })

      if (response.success) {
        return {
          success: true,
          message: `Transaction status: ${response.result?.status}`,
          result: response.result,
        }
      } else {
        throw new Error(response.error || 'Transaction status check failed')
      }
    })
  }

  const testTokenMetadata = async () => {
    await runTest('Token Metadata', async () => {
      const sampleTokenId =
        selectedChain === 'algorand'
          ? '123456789'
          : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

      const response: BlockchainResponse = await apiClient.getTokenMetadata({
        tokenId: sampleTokenId,
      })

      if (response.success) {
        return {
          success: true,
          message: `Token metadata retrieved: ${response.result?.name || 'Unknown'}`,
          result: response.result,
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
      testTokenMetadata,
    ]

    for (const test of tests) {
      await test()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setIsRunning(false)
  }

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  const passedCount = testResults.filter((t) => t.status === 'success').length
  const failedCount = testResults.filter((t) => t.status === 'failed').length
  const runningCount = testResults.filter((t) => t.status === 'running').length

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Testing Interface</h3>
          <Button onClick={testAllFunctions} disabled={isRunning}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ti-address">Test Address</Label>
                <Input
                  id="ti-address"
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="Enter test address..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ti-token">Token ID (Optional)</Label>
                <Input
                  id="ti-token"
                  type="text"
                  value={testTokenId}
                  onChange={(e) => setTestTokenId(e.target.value)}
                  placeholder="Enter token ID..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ti-amount">Test Amount</Label>
                <Input
                  id="ti-amount"
                  type="text"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="Enter amount..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={testAddressValidation} disabled={isRunning}>
            Test Address Validation
          </Button>
          <Button onClick={testBalanceRetrieval} disabled={isRunning}>
            Test Balance Retrieval
          </Button>
          <Button onClick={testTransactionStatus} disabled={isRunning}>
            Test Transaction Status
          </Button>
          <Button onClick={testTokenMetadata} disabled={isRunning}>
            Test Token Metadata
          </Button>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No test results yet. Run a test to see results.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className={`w-full text-left border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTest === result.id
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() =>
                      setSelectedTest(selectedTest === result.id ? null : result.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            result.status === 'success'
                              ? 'bg-green-500 dark:bg-green-400'
                              : result.status === 'failed'
                                ? 'bg-destructive'
                                : result.status === 'running'
                                  ? 'bg-blue-500 dark:bg-blue-400'
                                  : 'bg-muted-foreground'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{result.testName}</p>
                          <p className="text-xs text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${statusBadgeClass(result.status)}`}>
                          {result.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDuration(result.duration)}
                        </p>
                      </div>
                    </div>

                    {selectedTest === result.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Details:</p>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto font-mono">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Statistics */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{testResults.length}</p>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-green-600">{passedCount}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-destructive">{failedCount}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-blue-600">{runningCount}</p>
                <p className="text-sm text-muted-foreground">Running</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
