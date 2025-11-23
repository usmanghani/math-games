import { render, screen } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'
import AuthPage from './page'

let modeParam = 'login'

vi.mock('next/navigation', () => {
  const push = vi.fn()
  return {
    useRouter: () => ({ push }),
    useSearchParams: () => new URLSearchParams(modeParam ? `mode=${modeParam}` : ''),
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}))

vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login form</div>,
}))

vi.mock('@/components/auth/SignUpForm', () => ({
  SignUpForm: () => <div data-testid="signup-form">Sign up form</div>,
}))

describe('AuthPage tab selection', () => {
  it('shows the sign up tab when mode=signup is in the query', () => {
    modeParam = 'signup'
    render(<AuthPage />)

    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
    expect(screen.getByText('Join the adventure!')).toBeInTheDocument()
  })

  it('defaults to sign in when no mode is provided', () => {
    modeParam = ''
    render(<AuthPage />)

    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument()
    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
  })
})
