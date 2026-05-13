/**
 * Authentication Integration Tests
 *
 * These tests verify the integration between the frontend authentication system
 * and the backend Avatar NFT Service.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { AuthProvider, useAuth, AuthModal } from '@/lib/auth'

// Mock the AuthProvider internal logic
jest.mock('@/lib/auth', () => {
  const actual = jest.requireActual('@/lib/auth')
  return {
    ...actual,
  }
})

describe('Authentication Integration', () => {
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

  describe('AuthModal', () => {
    it('should render login form initially', () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />
        </AuthProvider>
      )

      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('should switch to registration form', () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />
        </AuthProvider>
      )

      fireEvent.click(screen.getByText("Don't have an account? Sign up"))

      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    })

    it('should handle login submission', async () => {
      const onSuccess = jest.fn()

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={onSuccess} />
        </AuthProvider>
      )

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })

      fireEvent.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should handle login error with empty fields', async () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />
        </AuthProvider>
      )

      fireEvent.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByText('Email and password are required')).toBeInTheDocument()
      })
    })

    it('should handle registration with mismatched passwords', async () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />
        </AuthProvider>
      )

      fireEvent.click(screen.getByText("Don't have an account? Sign up"))

      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' },
      })
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'different' },
      })

      fireEvent.click(screen.getByText('Sign Up'))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })
  })

  describe('useAuth Hook', () => {
    it('should provide auth state', () => {
      const TestComponent = () => {
        const { isAuthenticated, user, loading } = useAuth()
        return (
          <div>
            <div data-testid="is-auth">{isAuthenticated.toString()}</div>
            <div data-testid="user">{user?.username || 'null'}</div>
            <div data-testid="loading">{loading.toString()}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })

    it('should handle login through hook', async () => {
      const TestComponent = () => {
        const { login, isAuthenticated, user } = useAuth()
        const [loginResult, setLoginResult] = useState<boolean | null>(null)

        const handleLogin = async () => {
          const result = await login('test@example.com', 'password123')
          setLoginResult(result)
        }

        return (
          <div>
            <button onClick={handleLogin}>Login</button>
            <div data-testid="is-auth">{isAuthenticated.toString()}</div>
            <div data-testid="user">{user?.username || 'null'}</div>
            {loginResult && <div data-testid="login-success">Success</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('login-success')).toBeInTheDocument()
        expect(screen.getByTestId('is-auth')).toHaveTextContent('true')
        expect(screen.getByTestId('user')).toHaveTextContent('test')
      })
    })
  })

  describe('Token Management', () => {
    it('should store user data on login', async () => {
      const TestComponent = () => {
        const { login } = useAuth()
        return <button onClick={() => login('test@example.com', 'pass')}>Login</button>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled()
      })
    })

    it('should clear user data on logout', async () => {
      const TestComponent = () => {
        const { logout, isAuthenticated } = useAuth()
        const [loggedOut, setLoggedOut] = useState(false)

        const handleLogout = () => {
          logout()
          setLoggedOut(true)
        }

        return (
          <div>
            <button onClick={handleLogout}>Logout</button>
            {loggedOut && <div data-testid="logged-out">Logged Out</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      fireEvent.click(screen.getByText('Logout'))

      await waitFor(() => {
        expect(screen.getByTestId('logged-out')).toBeInTheDocument()
        expect(localStorage.removeItem).toHaveBeenCalledWith('oasis_user')
      })
    })
  })
})
