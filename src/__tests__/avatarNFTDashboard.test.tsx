/**
 * Avatar NFT Dashboard Integration Tests
 *
 * These tests verify the integration between the frontend Avatar NFT Dashboard
 * and the backend Avatar NFT Service.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AvatarNFTDashboard } from '@/components/AvatarNFTDashboard'

describe('AvatarNFTDashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  })

  describe('Dashboard Rendering', () => {
    it('should render the dashboard with title', () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      expect(screen.getByText('Avatar NFT Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Create Avatar')).toBeInTheDocument()
    })

    it('should show sample avatars after loading', async () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      await waitFor(() => {
        expect(screen.getByText('Cosmic Warrior')).toBeInTheDocument()
        expect(screen.getByText('Digital Sage')).toBeInTheDocument()
      })
    })
  })

  describe('NFT Loading', () => {
    it('should display NFTs when available', async () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      await waitFor(() => {
        expect(screen.getByText('Cosmic Warrior')).toBeInTheDocument()
        expect(screen.getByText('A brave warrior from the cosmic realm')).toBeInTheDocument()
        expect(screen.getByText('Digital Sage')).toBeInTheDocument()
      })
    })

    it('should show summary statistics', async () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      await waitFor(() => {
        expect(screen.getByText('Total Avatars')).toBeInTheDocument()
        expect(screen.getByText('Legendary')).toBeInTheDocument()
        expect(screen.getByText('Epic')).toBeInTheDocument()
      })
    })
  })

  describe('NFT Minting Dialog', () => {
    it('should open create dialog when clicking create button', async () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      const createButton = screen.getByText('Create Avatar')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Avatar')).toBeInTheDocument()
        expect(screen.getByLabelText('Avatar Name')).toBeInTheDocument()
      })
    })

    it('should create a new avatar when form is submitted', async () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      // Open create dialog
      fireEvent.click(screen.getByText('Create Avatar'))

      await waitFor(() => {
        expect(screen.getByLabelText('Avatar Name')).toBeInTheDocument()
      })

      // Fill form
      fireEvent.change(screen.getByLabelText('Avatar Name'), {
        target: { value: 'Test NFT' },
      })
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Test description' },
      })

      // Submit
      fireEvent.click(screen.getByText('Create Avatar'))

      await waitFor(() => {
        expect(screen.getByText('Test NFT')).toBeInTheDocument()
      })
    })
  })

  describe('NFT Details Dialog', () => {
    it('should show NFT details when clicking on an avatar', async () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Cosmic Warrior'))
      })

      await waitFor(() => {
        expect(screen.getByText('Attributes')).toBeInTheDocument()
        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
      })
    })
  })

  describe('Chain Integration', () => {
    it('should display chain type in detail dialog', async () => {
      render(<AvatarNFTDashboard selectedChain="solana" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Cosmic Warrior'))
      })

      await waitFor(() => {
        expect(screen.getAllByText('algorand').length).toBeGreaterThan(0)
      })
    })
  })
})
