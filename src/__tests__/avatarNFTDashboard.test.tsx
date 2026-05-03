/**
 * Avatar NFT Dashboard Integration Tests
 * 
 * These tests verify the integration between the frontend Avatar NFT Dashboard
 * and the backend Avatar NFT Service.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AuthProvider } from '@/lib/auth'
import { AvatarNFTDashboard } from '@/components/AvatarNFTDashboard'
import { useAuth } from '@/lib/auth'

// Mock the API calls
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    getToken: jest.fn(),
    getUser: jest.fn(),
    clearAuth: jest.fn(),
    isAuthenticated: jest.fn(),
    getAvatarNFTs: jest.fn(),
    mintAvatarNFT: jest.fn(),
    bindHolonToNFT: jest.fn(),
    bindWalletToNFT: jest.fn(),
    getNFTComposite: jest.fn(),
  }
}))

describe('AvatarNFTDashboard Integration', () => {
  const mockNFTs = [
    {
      id: 'nft-1',
      name: 'My Avatar NFT',
      description: 'My first avatar NFT',
      chainType: 'Solana',
      imageUrl: 'https://example.com/nft1.png',
      isSoulbound: true,
      isTransferable: false,
      mintedDate: '2024-01-15T10:00:00Z',
      holonBindings: [
        {
          holonId: 'holon-1',
          holonName: 'Main Holon',
          role: 'owner',
          isActive: true
        }
      ],
      walletBindings: [
        {
          walletId: 'wallet-1',
          walletAddress: '11111111111111111111111111111111',
          bindingType: 'primary',
          isActive: true
        }
      ]
    }
  ]

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    global.localStorage = localStorageMock as any
  })

  describe('Authentication State', () => {
    it('should show authentication required when not logged in', () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(false)

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      expect(screen.getByText('Authentication Required')).toBeInTheDocument()
      expect(screen.getByText('Please sign in to access your Avatar NFTs')).toBeInTheDocument()
    })

    it('should show NFT dashboard when authenticated', () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      expect(screen.getByText('Avatar NFT Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Mint Avatar NFT')).toBeInTheDocument()
    })
  })

  describe('NFT Loading', () => {
    it('should show loading state while fetching NFTs', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockImplementation(() => new Promise(() => {}))

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      expect(screen.getByText('Loading NFTs...')).toBeInTheDocument()
    })

    it('should show no NFTs state when empty', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue([])

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('No Avatar NFTs Yet')).toBeInTheDocument()
        expect(screen.getByText('Mint your first Avatar NFT to represent your digital identity')).toBeInTheDocument()
      })
    })

    it('should display NFTs when available', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue(mockNFTs)

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('My Avatar NFT')).toBeInTheDocument()
        expect(screen.getByText('My first avatar NFT')).toBeInTheDocument()
        expect(screen.getByText('Solana')).toBeInTheDocument()
        expect(screen.getByText('Soulbound')).toBeInTheDocument()
      })
    })
  })

  describe('NFT Minting', () => {
    it('should open mint dialog when clicking mint button', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue([])

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        const mintButton = screen.getByText('Mint Your First NFT')
        fireEvent.click(mintButton)
      })

      expect(screen.getByText('Mint Avatar NFT')).toBeInTheDocument()
      expect(screen.getByLabelText('NFT Name *')).toBeInTheDocument()
    })

    it('should handle NFT minting submission', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue([])
      authService.mintAvatarNFT.mockResolvedValue({
        success: true,
        result: { id: 'new-nft-1' }
      })

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      // Open mint dialog
      await waitFor(() => {
        fireEvent.click(screen.getByText('Mint Your First NFT'))
      })

      // Fill form
      fireEvent.change(screen.getByLabelText('NFT Name *'), {
        target: { value: 'Test NFT' }
      })
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Test description' }
      })
      fireEvent.change(screen.getByLabelText('Image URL'), {
        target: { value: 'https://example.com/nft.png' }
      })

      // Submit form
      fireEvent.click(screen.getByText('Mint NFT'))

      await waitFor(() => {
        expect(authService.mintAvatarNFT).toHaveBeenCalledWith({
          name: 'Test NFT',
          description: 'Test description',
          imageUrl: 'https://example.com/nft.png',
          chainType: 'solana',
          isSoulbound: false,
          isTransferable: true,
          metadataURI: ''
        })
      })
    })

    it('should handle minting errors', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue([])
      authService.mintAvatarNFT.mockRejectedValue(new Error('Minting failed'))

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      // Open mint dialog
      await waitFor(() => {
        fireEvent.click(screen.getByText('Mint Your First NFT'))
      })

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('NFT Name *'), {
        target: { value: 'Test NFT' }
      })
      fireEvent.click(screen.getByText('Mint NFT'))

      await waitFor(() => {
        expect(screen.getByText('NFT minting failed')).toBeInTheDocument()
      })
    })
  })

  describe('NFT Binding', () => {
    it('should bind holon to NFT', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue(mockNFTs)
      authService.bindHolonToNFT.mockResolvedValue({
        success: true,
        result: { id: 'binding-1' }
      })

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        const bindButton = screen.getByText('Bind Holon')
        fireEvent.click(bindButton)
      })

      await waitFor(() => {
        expect(authService.bindHolonToNFT).toHaveBeenCalledWith(
          'nft-1',
          'sample-holon-id',
          'owner'
        )
      })
    })

    it('should bind wallet to NFT', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue(mockNFTs)
      authService.bindWalletToNFT.mockResolvedValue({
        success: true,
        result: { id: 'binding-1' }
      })

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        const bindButton = screen.getByText('Bind Wallet')
        fireEvent.click(bindButton)
      })

      await waitFor(() => {
        expect(authService.bindWalletToNFT).toHaveBeenCalledWith(
          'nft-1',
          'sample-wallet-id',
          'primary'
        )
      })
    })
  })

  describe('NFT Details', () => {
    it('should show NFT details in modal', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue(mockNFTs)

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        const detailsButton = screen.getByText('View Details')
        fireEvent.click(detailsButton)
      })

      await waitFor(() => {
        expect(screen.getByText('NFT Details')).toBeInTheDocument()
        expect(screen.getByText('My Avatar NFT')).toBeInTheDocument()
        expect(screen.getByText('My first avatar NFT')).toBeInTheDocument()
        expect(screen.getByText('Solana')).toBeInTheDocument()
      })
    })

    it('should fetch composite NFT data', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue(mockNFTs)
      authService.getNFTComposite.mockResolvedValue({
        success: true,
        result: {
          avatarNFTId: 'nft-1',
          avatarId: 'user-1',
          name: 'My Avatar NFT',
          chainType: 'Solana',
          holonBindings: mockNFTs[0].holonBindings,
          walletBindings: mockNFTs[0].walletBindings
        }
      })

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        const detailsButton = screen.getByText('View Details')
        fireEvent.click(detailsButton)
      })

      await waitFor(() => {
        expect(authService.getNFTComposite).toHaveBeenCalledWith('nft-1')
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockRejectedValue(new Error('API Error'))

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch NFTs')).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockRejectedValue(new Error('Network Error'))

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch NFTs')).toBeInTheDocument()
      })
    })
  })

  describe('Chain Integration', () => {
    it('should display correct chain icons', () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue([
        { ...mockNFTs[0], chainType: 'Solana' },
        { ...mockNFTs[0], chainType: 'Algorand' }
      ])

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      // Chain icons should be displayed
      expect(screen.getByText('🟣')).toBeInTheDocument() // Solana
      expect(screen.getByText('🔵')).toBeInTheDocument() // Algorand
    })

    it('should handle chain-specific features', async () => {
      const { authService } = require('@/lib/auth')
      authService.isAuthenticated.mockReturnValue(true)
      authService.getUser.mockReturnValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        isVerified: true,
        isActive: true
      })
      authService.getAvatarNFTs.mockResolvedValue(mockNFTs)

      render(
        <AuthProvider>
          <AvatarNFTDashboard selectedChain="solana" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Solana')).toBeInTheDocument()
      })
    })
  })
})