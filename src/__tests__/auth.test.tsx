/**
 * Authentication Integration Tests
 * 
 * These tests verify the integration between the frontend authentication system
 * and the backend Avatar NFT Service.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/lib/auth'
import { AuthModal } from '@/components/AuthModal'
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
  }
}))

describe('Authentication Integration', () => {
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

  describe('AuthModal', () => {
    it('should render login form initially', () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} />
        </AuthProvider>
      )

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('should switch to registration form', () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} />
        </AuthProvider>
      )

      const registerLink = screen.getByText("Don't have an account? Sign up")
      fireEvent.click(registerLink)

      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    })

    it('should handle successful login', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        token: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          isVerified: true,
          isActive: true
        }
      })

      // Mock the authService
      const { authService } = require('@/lib/auth')
      authService.login = mockLogin

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />
        </AuthProvider>
      )

      // Fill login form
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      })

      // Submit form
      fireEvent.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should handle login error', async () => {
      const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
      
      const { authService } = require('@/lib/auth')
      authService.login = mockLogin

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />
        </AuthProvider>
      )

      // Fill login form
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpassword' }
      })

      // Submit form
      fireEvent.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument()
      })
    })

    it('should handle successful registration', async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        token: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          isVerified: true,
          isActive: true
        }
      })

      const { authService } = require('@/lib/auth')
      authService.register = mockRegister

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />
        </AuthProvider>
      )

      // Switch to registration
      fireEvent.click(screen.getByText("Don't have an account? Sign up"))

      // Fill registration form
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' }
      })
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      })
      fireEvent.change(screen.getByLabelText('First Name'), {
        target: { value: 'Test' }
      })
      fireEvent.change(screen.getByLabelText('Last Name'), {
        target: { value: 'User' }
      })

      // Submit form
      fireEvent.click(screen.getByText('Create Account'))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          'testuser',
          'test@example.com',
          'password123',
          'Test',
          'User'
        )
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
      const mockLogin = jest.fn().mockResolvedValue({
        token: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          isVerified: true,
          isActive: true
        }
      })

      const { authService } = require('@/lib/auth')
      authService.login = mockLogin

      const TestComponent = () => {
        const { login, isAuthenticated, user } = useAuth()
        const [loginResult, setLoginResult] = useState(null)

        const handleLogin = async () => {
          try {
            const result = await login('test@example.com', 'password123')
            setLoginResult(result)
          } catch (error) {
            setLoginError(error.message)
          }
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
        expect(screen.getByTestId('user')).toHaveTextContent('testuser')
      })
    })
  })

  describe('Token Management', () => {
    it('should store token in localStorage', () => {
      const mockToken = 'test-token-123'
      
      const { authService } = require('@/lib/auth')
      authService.getToken = () => mockToken

      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      )

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken)
    })

    it('should clear token on logout', async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined)
      
      const { authService } = require('@/lib/auth')
      authService.logout = mockLogout

      const TestComponent = () => {
        const { logout, isAuthenticated } = useAuth()
        const [loggedOut, setLoggedOut] = useState(false)

        const handleLogout = async () => {
          await logout()
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
        expect(mockLogout).toHaveBeenCalled()
        expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
      })
    })
  })
})