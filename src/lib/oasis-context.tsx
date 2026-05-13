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

export type WalletType = 'External' | 'Platform'

/** Normalize walletType from API — handles both string ("External"/"Platform") and integer (0/1) formats */
function normalizeWalletType(raw: unknown): WalletType {
  if (raw === 'External' || raw === 'Platform') return raw
  if (raw === 1) return 'Platform'
  return 'External' // covers 0, null, undefined, or any other value
}

function normalizeWalletEntry(w: any): WalletEntry {
  return {
    ...w,
    walletType: normalizeWalletType(w.walletType),
  }
}

export interface WalletEntry {
  id: string
  chainType: string
  address: string
  label?: string
  isDefault: boolean
  walletType: WalletType
  encryptedPrivateKey?: string
  encryptedSeedPhrase?: string
}

export interface WalletExportData {
  walletId: string
  chainType: string
  address: string
  publicKey?: string
  privateKey: string
  seedPhrase?: string
}

export interface OasisState {
  user: AuthProfile | null
  isAuthenticated: boolean
  authLoading: boolean
  avatarId: string | null
  wallets: WalletEntry[]
  walletsLoading: boolean
  walletsError: string | null
  defaultWallet: WalletEntry | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (params: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshWallets: () => Promise<void>
  setDefaultWallet: (walletId: string) => Promise<void>
  addWallet: (params: { chainType: string; address: string; label?: string; isDefault?: boolean }) => Promise<{ success: boolean; error?: string }>
  removeWallet: (walletId: string) => Promise<{ success: boolean; error?: string }>
  generateWallet: (params: { chainType: string; label?: string; isDefault?: boolean }) => Promise<{ success: boolean; error?: string }>
  connectExternalWallet: (params: { chainType: string; address: string; publicKey?: string; label?: string; isDefault?: boolean }) => Promise<{ success: boolean; error?: string }>
  exportWallet: (walletId: string) => Promise<{ success: boolean; data?: WalletExportData; error?: string }>
  browserWalletAvailable: (chainType: string) => boolean
  getBrowserWalletAddress: (chainType: string) => Promise<string | null>
  connectBrowserWallet: (chainType: string) => Promise<{ success: boolean; address?: string; error?: string }>
}

const OasisContext = createContext<OasisState | undefined>(undefined)
export { OasisContext }

// ─── Direct API helpers (bypass SDK's broken token-refresh on first auth) ───

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/** Call /api/avatar/login directly, extract JWT + avatarId */
async function directLogin(email: string, password: string): Promise<{ token: string; avatarId: string }> {
  const resp = await fetch(`${API_BASE}/api/avatar/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    const msg = (err.message ?? err.title) || (err.errors ? Object.values(err.errors).flat().join('; ') : null) || `Login failed: HTTP ${resp.status}`
    throw new Error(msg)
  }
  const data = await resp.json()
  const token: string | undefined = data.result
  if (!token) throw new Error('No token returned')
  // Decode JWT payload to get avatarId
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT')
  const payload = parts[1]!.replace(/-/g, '+').replace(/_/g, '/')
  const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
  const decoded = JSON.parse(atob(padded)) as Record<string, unknown>
  const avatarId = (decoded.sub as string) ?? (decoded.nameid as string)
  if (!avatarId) throw new Error('No avatarId in token')
  return { token, avatarId }
}

/** Persist a JWT into the SDK's session manager (via localStorage + restore) */
async function persistSession(token: string, avatarId: string) {
  // Write directly to localStorage using the same keys the SDK uses
  if (typeof window !== 'undefined') {
    localStorage.setItem('oasis_token', token)
    localStorage.setItem('oasis_avatar_id', avatarId)
  }
  // Tell the session manager to reload from storage
  await oasis.session.restore()
}

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
          } else {
            // Profile fetch failed (e.g., 404 — avatar deleted, DB reset)
            // Clear stale session so the UI doesn't hang showing "logged in"
            await oasis.session.logout()
            await oasis.session.restore()
          }
        }
      } catch {
        // Session restore failed — start fresh
        await oasis.session.logout().catch(() => {})
      } finally {
        setAuthLoading(false)
      }
    }
    restore()
  }, [])

  const avatarId = oasis.auth.avatarId

  const refreshWallets = useCallback(async () => {
    if (!avatarId) { setWallets([]); return }
    setWalletsLoading(true); setWalletsError(null)
    const result = await oasis.api.request<WalletEntry[]>('GET', `/api/wallet?avatarId=${avatarId}`)
    if (isOk(result)) setWallets(result.value.map(normalizeWalletEntry)); else setWalletsError(result.error.message)
    setWalletsLoading(false)
  }, [avatarId])

  useEffect(() => {
    if (avatarId) refreshWallets(); else setWallets([])
  }, [avatarId, refreshWallets])

  const refreshProfile = useCallback(async () => {
    if (!oasis.auth.isAuthenticated) return
    const r = await oasis.auth.getProfile()
    if (isOk(r)) setUser(r.value)
  }, [])

  /**
   * Login using direct fetch to avoid the SDK bug where
   * `fetchWithAuth → createRefreshCallback()` throws
   * "No session token available" on first login attempt.
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token, avatarId: aid } = await directLogin(email, password)
      await persistSession(token, aid)
      const profileResult = await oasis.auth.getProfile()
      if (isOk(profileResult)) setUser(profileResult.value)
      return { success: true }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Login failed' }
    }
  }, [])

  /**
   * Register + auto-login via direct fetch.
   * The SDK's `register()` internally calls `login()` which hits the same
   * token-refresh bug, so we bypass it entirely.
   */
  const register = useCallback(async (params: { username: string; email: string; password: string }) => {
    // 1. Register
    const regResp = await fetch(`${API_BASE}/api/avatar/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: params.username, email: params.email, password: params.password }),
    })
    if (!regResp.ok) {
      const errData = await regResp.json().catch(() => ({}))
      const msg = (errData.message ?? errData.title) ||
        (errData.errors ? Object.values(errData.errors).flat().join('; ') : null) ||
        `Registration failed: HTTP ${regResp.status}`
      return { success: false, error: String(msg) }
    }

    // 2. Login with new credentials
    try {
      const { token, avatarId: aid } = await directLogin(params.email, params.password)
      await persistSession(token, aid)
      const profileResult = await oasis.auth.getProfile()
      if (isOk(profileResult)) setUser(profileResult.value)
      return { success: true }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Login after registration failed' }
    }
  }, [])

  const logout = useCallback(async () => {
    await oasis.auth.logout()
    setUser(null); setWallets([]); setWalletsError(null)
  }, [])

  const setDefaultWallet = useCallback(async (walletId: string) => {
    const result = await oasis.api.request('POST', `/api/wallet/${walletId}/set-default`)
    if (isOk(result)) await refreshWallets()
  }, [refreshWallets])

  const addWallet = useCallback(async (params: { chainType: string; address: string; label?: string; isDefault?: boolean }) => {
    if (!avatarId) return { success: false, error: 'No avatar ID' }
    const result = await oasis.api.request('POST', '/api/wallet', {
      avatarId, chainType: params.chainType, address: params.address.trim(),
      label: params.label?.trim() || undefined, isDefault: params.isDefault ?? false,
      walletType: 'External',
    })
    if (isOk(result)) { await refreshWallets(); return { success: true } }
    return { success: false, error: result.error.message }
  }, [avatarId, refreshWallets])

  const removeWallet = useCallback(async (walletId: string) => {
    const result = await oasis.api.request('DELETE', `/api/wallet/${walletId}`)
    if (isOk(result)) { await refreshWallets(); return { success: true } }
    return { success: false, error: result.error.message }
  }, [refreshWallets])

  // ─── New: Generate wallet on-platform ───

  const generateWallet = useCallback(async (params: { chainType: string; label?: string; isDefault?: boolean }) => {
    if (!avatarId) return { success: false, error: 'No avatar ID' }
    const result = await oasis.api.request('POST', '/api/wallet/generate', {
      chainType: params.chainType,
      label: params.label?.trim() || undefined,
      isDefault: params.isDefault ?? false,
    })
    if (isOk(result)) { await refreshWallets(); return { success: true } }
    return { success: false, error: result.error.message }
  }, [avatarId, refreshWallets])

  // ─── New: Connect external wallet ───

  const connectExternalWallet = useCallback(async (params: { chainType: string; address: string; publicKey?: string; label?: string; isDefault?: boolean }) => {
    if (!avatarId) return { success: false, error: 'No avatar ID' }
    const result = await oasis.api.request('POST', '/api/wallet/connect', {
      chainType: params.chainType,
      address: params.address.trim(),
      publicKey: params.publicKey,
      label: params.label?.trim() || undefined,
      isDefault: params.isDefault ?? false,
    })
    if (isOk(result)) { await refreshWallets(); return { success: true } }
    return { success: false, error: result.error.message }
  }, [avatarId, refreshWallets])

  // ─── New: Export wallet private key ───

  const exportWallet = useCallback(async (walletId: string): Promise<{ success: boolean; data?: WalletExportData; error?: string }> => {
    const result = await oasis.api.request<WalletExportData>('POST', `/api/wallet/${walletId}/export`)
    if (isOk(result)) return { success: true, data: result.value }
    return { success: false, error: result.error.message }
  }, [])

  // ─── Browser wallet detection & connection ───

  const browserWalletAvailable = useCallback((chainType: string): boolean => {
    if (typeof window === 'undefined') return false
    const ct = chainType.toLowerCase()
    if (ct === 'ethereum' || ct === 'eth') {
      return typeof (window as any).ethereum !== 'undefined'
    }
    if (ct === 'algorand' || ct === 'algo') {
      return typeof (window as any).algorand !== 'undefined' ||
             typeof (window as any).myAlgoWallet !== 'undefined' ||
             typeof (window as any).PeraWallet !== 'undefined'
    }
    if (ct === 'solana') {
      return typeof (window as any).solana !== 'undefined' ||
             typeof (window as any).phantom !== 'undefined'
    }
    return false
  }, [])

  const getBrowserWalletAddress = useCallback(async (chainType: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null
    const ct = chainType.toLowerCase()

    try {
      if (ct === 'ethereum' || ct === 'eth') {
        const eth = (window as any).ethereum
        if (!eth) return null
        const accounts: string[] = await eth.request({ method: 'eth_accounts' })
        return accounts?.[0] ?? null
      }
      if (ct === 'algorand' || ct === 'algo') {
        const algo = (window as any).algorand
        if (algo?.accounts?.length) return algo.accounts[0]
        if ((window as any).PeraWallet) return null // need to connect first
        return null
      }
      if (ct === 'solana') {
        const sol = (window as any).solana ?? (window as any).phantom
        if (!sol) return null
        if (sol.publicKey) return sol.publicKey.toString()
        // Some wallets expose connected address differently
        const resp = await sol.connect({ onlyIfTrusted: true }).catch(() => null)
        return resp?.publicKey?.toString() ?? null
      }
    } catch { return null }
    return null
  }, [])

  const connectBrowserWallet = useCallback(async (chainType: string): Promise<{ success: boolean; address?: string; error?: string }> => {
    if (typeof window === 'undefined') return { success: false, error: 'Not in browser' }
    const ct = chainType.toLowerCase()

    try {
      if (ct === 'ethereum' || ct === 'eth') {
        const eth = (window as any).ethereum
        if (!eth) return { success: false, error: 'No Ethereum wallet detected (MetaMask, etc.)' }
        const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
        if (!accounts?.[0]) return { success: false, error: 'No accounts returned' }
        return { success: true, address: accounts[0] }
      }
      if (ct === 'algorand' || ct === 'algo') {
        const algo = (window as any).algorand
        if (algo?.connect) {
          const result = await algo.connect()
          return { success: true, address: result?.address ?? result?.accounts?.[0] }
        }
        // PeraWallet / MyAlgo
        const pera = (window as any).PeraWallet
        if (pera?.connect) {
          const result = await pera.connect()
          return { success: true, address: result?.address ?? result?.accounts?.[0] }
        }
        return { success: false, error: 'No Algorand wallet detected (Pera, MyAlgo, etc.)' }
      }
      if (ct === 'solana') {
        const sol = (window as any).solana ?? (window as any).phantom
        if (!sol?.connect) return { success: false, error: 'No Solana wallet detected (Phantom, Solflare, etc.)' }
        const result = await sol.connect()
        return { success: true, address: result?.publicKey?.toString() }
      }
      return { success: false, error: `Unsupported chain: ${chainType}` }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Connection failed' }
    }
  }, [])

  const defaultWallet = useMemo(() => wallets.find(w => w.isDefault) ?? wallets[0] ?? null, [wallets])

  const value = useMemo<OasisState>(() => ({
    user, isAuthenticated: oasis.auth.isAuthenticated, authLoading, avatarId,
    wallets, walletsLoading, walletsError, defaultWallet,
    login, register, logout, refreshProfile, refreshWallets, setDefaultWallet, addWallet, removeWallet,
    generateWallet, connectExternalWallet, exportWallet,
    browserWalletAvailable, getBrowserWalletAddress, connectBrowserWallet,
  }), [user, authLoading, avatarId, wallets, walletsLoading, walletsError, defaultWallet, login, register, logout, refreshProfile, refreshWallets, setDefaultWallet, addWallet, removeWallet, generateWallet, connectExternalWallet, exportWallet, browserWalletAvailable, getBrowserWalletAddress, connectBrowserWallet])

  return <OasisContext.Provider value={value}>{children}</OasisContext.Provider>
}

export function useOasis() {
  const ctx = useContext(OasisContext)
  if (!ctx) throw new Error('useOasis must be used within an OasisProvider')
  return ctx
}

export function useWalletForChain(chain?: string) {
  const { wallets, defaultWallet } = useOasis()
  if (!chain) return defaultWallet
  return wallets.find(w => w.chainType.toLowerCase() === chain.toLowerCase()) ?? defaultWallet
}
