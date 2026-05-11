'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { oasis, isOk } from './oasis'
import type { AuthProfile } from './oasis'

// ─── Types ───

export interface WalletEntry {
  id: string
  chainType: string
  address: string
  label?: string
  isDefault: boolean
}

export interface OasisState {
  // Auth
  user: AuthProfile | null
  isAuthenticated: boolean
  authLoading: boolean

  // Avatar
  avatarId: string | null

  // Wallets
  wallets: WalletEntry[]
  walletsLoading: boolean
  walletsError: string | null
  defaultWallet: WalletEntry | null

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (params: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshWallets: () => Promise<void>
  setDefaultWallet: (walletId: string) => Promise<void>
  addWallet: (params: { chainType: string; address: string; label?: string; isDefault?: boolean }) => Promise<{ success: boolean; error?: string }>
  removeWallet: (walletId: string) => Promise<{ success: boolean; error?: string }>
}

const OasisContext = createContext<OasisState | undefined>(undefined)
export { OasisContext }

// ─── Provider ───

export function OasisProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [walletsLoading, setWalletsLoading] = useState(false)
  const [walletsError, setWalletsError] = useState<string | null>(null)

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        await oasis.session.restore()
        if (oasis.auth.isAuthenticated) {
          const profileResult = await oasis.auth.getProfile()
          if (isOk(profileResult)) {
            setUser(profileResult.value)
          }
        }
      } catch {
        // Session restore failed — start fresh
      } finally {
        setAuthLoading(false)
      }
    }
    restore()
  }, [])

  // Auto-load wallets when avatarId becomes available
  const avatarId = oasis.auth.avatarId

  const refreshWallets = useCallback(async () => {
    if (!avatarId) {
      setWallets([])
      return
    }
    setWalletsLoading(true)
    setWalletsError(null)
    const result = await oasis.api.request<WalletEntry[]>(
      'GET',
      `/api/wallet?avatarId=${avatarId}`
    )
    if (isOk(result)) {
      setWallets(result.value)
    } else {
      setWalletsError(result.error.message)
    }
    setWalletsLoading(false)
  }, [avatarId])

  useEffect(() => {
    if (avatarId) {
      refreshWallets()
    } else {
      setWallets([])
    }
  }, [avatarId, refreshWallets])

  const refreshProfile = useCallback(async () => {
    if (!oasis.auth.isAuthenticated) return
    const profileResult = await oasis.auth.getProfile()
    if (isOk(profileResult)) {
      setUser(profileResult.value)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await oasis.auth.login(email, password)
    if (!isOk(result)) {
      return { success: false, error: result.error.message }
    }
    const profileResult = await oasis.auth.getProfile()
    if (isOk(profileResult)) {
      setUser(profileResult.value)
    }
    return { success: true }
  }, [])

  const register = useCallback(async (params: { username: string; email: string; password: string }) => {
    const result = await oasis.auth.register(params)
    if (!isOk(result)) {
      return { success: false, error: result.error.message }
    }
    const profileResult = await oasis.auth.getProfile()
    if (isOk(profileResult)) {
      setUser(profileResult.value)
    }
    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await oasis.auth.logout()
    setUser(null)
    setWallets([])
    setWalletsError(null)
  }, [])

  const setDefaultWallet = useCallback(async (walletId: string) => {
    const result = await oasis.api.request('POST', `/api/wallet/${walletId}/set-default`)
    if (isOk(result)) {
      await refreshWallets()
    }
  }, [refreshWallets])

  const addWallet = useCallback(async (params: { chainType: string; address: string; label?: string; isDefault?: boolean }) => {
    if (!avatarId) return { success: false, error: 'No avatar ID' }
    const result = await oasis.api.request('POST', '/api/wallet', {
      avatarId,
      chainType: params.chainType,
      address: params.address.trim(),
      label: params.label?.trim() || undefined,
      isDefault: params.isDefault ?? false,
    })
    if (isOk(result)) {
      await refreshWallets()
      return { success: true }
    }
    return { success: false, error: result.error.message }
  }, [avatarId, refreshWallets])

  const removeWallet = useCallback(async (walletId: string) => {
    const result = await oasis.api.request('DELETE', `/api/wallet/${walletId}`)
    if (isOk(result)) {
      await refreshWallets()
      return { success: true }
    }
    return { success: false, error: result.error.message }
  }, [refreshWallets])

  const defaultWallet = useMemo(
    () => wallets.find((w) => w.isDefault) ?? wallets[0] ?? null,
    [wallets]
  )

  const value = useMemo<OasisState>(
    () => ({
      user,
      isAuthenticated: oasis.auth.isAuthenticated,
      authLoading,
      avatarId,
      wallets,
      walletsLoading,
      walletsError,
      defaultWallet,
      login,
      register,
      logout,
      refreshProfile,
      refreshWallets,
      setDefaultWallet,
      addWallet,
      removeWallet,
    }),
    [
      user,
      authLoading,
      avatarId,
      wallets,
      walletsLoading,
      walletsError,
      defaultWallet,
      login,
      register,
      logout,
      refreshProfile,
      refreshWallets,
      setDefaultWallet,
      addWallet,
      removeWallet,
    ]
  )

  return <OasisContext.Provider value={value}>{children}</OasisContext.Provider>
}

// ─── Hook ───

export function useOasis() {
  const ctx = useContext(OasisContext)
  if (!ctx) throw new Error('useOasis must be used within an OasisProvider')
  return ctx
}

/** Convenience hook — returns wallet filtered by chain (or default wallet). */
export function useWalletForChain(chain?: string) {
  const { wallets, defaultWallet } = useOasis()
  if (!chain) return defaultWallet
  return wallets.find((w) => w.chainType.toLowerCase() === chain.toLowerCase()) ?? defaultWallet
}
