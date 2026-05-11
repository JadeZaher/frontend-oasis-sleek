'use client'

/**
 * OASIS SDK integration for the frontend.
 *
 * Replaces the hand-rolled BlockchainApiClient and mock auth with
 * the @oasis/wallet-sdk OasisClient, providing:
 * - Real API calls to the .NET backend
 * - Session management with localStorage
 * - Multi-chain wallet with client-side signing
 * - Holon querying via fluent API
 * - Portfolio aggregation
 */

import {
  OasisClient,
  AlgorandProvider,
  SolanaProvider,
  TinymanAdapter,
  JupiterAdapter,
  isOk,
  isErr,
} from '@oasis/wallet-sdk'
import type {
  SessionState,
  HolonResult,
  BalanceInfo,
  ChainBalance,
  PortfolioSummary,
  AuthProfile,
  Result,
  SdkError,
} from '@oasis/wallet-sdk'

/** Placeholder type for avatar API responses (not exported by SDK) */
export type AvatarResponse = {
  id: string
  username: string
  email: string
  [key: string]: unknown
}

// ─── localStorage session adapter ───

const localStorageAdapter = {
  get: async (key: string) => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  set: async (key: string, value: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, value)
  },
  remove: async (key: string) => {
    if (typeof window !== 'undefined') localStorage.removeItem(key)
  },
}

// ─── SDK singleton ───

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const oasis = new OasisClient({
  apiUrl: API_BASE_URL,
  sessionStorage: localStorageAdapter,
  chains: {
    algorand: {
      provider: new AlgorandProvider({
        rpcUrl: process.env.NEXT_PUBLIC_ALGO_RPC || 'https://testnet-algod.algonode.cloud',
        algodUrl: process.env.NEXT_PUBLIC_ALGO_RPC || 'https://testnet-algod.algonode.cloud',
        network: 'testnet',
        indexerUrl: process.env.NEXT_PUBLIC_ALGO_INDEXER || 'https://testnet-idx.algonode.cloud',
      }),
      dex: new TinymanAdapter({ network: 'testnet' }),
    },
    solana: {
      provider: new SolanaProvider({
        rpcUrl: process.env.NEXT_PUBLIC_SOL_RPC || 'https://api.devnet.solana.com',
        network: 'devnet',
      }),
      dex: new JupiterAdapter(),
    },
  },
})

// ─── Helper wrappers for components ───

/** Unwrap a Result<T> for use in React components. Throws on error for error boundaries. */
export function unwrapResult<T>(result: Result<T, SdkError>): T {
  if (isOk(result)) return result.value
  throw new Error(result.error.message)
}

/** Safe unwrap — returns null on error instead of throwing. */
export function safeUnwrap<T>(result: Result<T, SdkError>): T | null {
  return isOk(result) ? result.value : null
}

// Re-export types for component use
export type {
  SessionState,
  HolonResult,
  BalanceInfo,
  ChainBalance,
  PortfolioSummary,
  AuthProfile,
}
export { isOk, isErr }
