# Authentication System - Usage Guide

This document explains how to use the authentication system in Number Line Adventure.

## Overview

The authentication system is built on Supabase Auth and provides:
- Email/password authentication
- Session management
- Protected routes
- React hooks for easy access to auth state

## Components

### 1. AuthContext & AuthProvider

The `AuthProvider` wraps your app and provides authentication state globally.

**Setup** (in `app/layout.tsx`):

```typescript
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. useAuth Hook

Access authentication state and methods anywhere in your app.

**Basic Usage**:

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, loading, signIn, signOut, isConfigured } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isConfigured) {
    return <div>Authentication not configured</div>
  }

  if (!user) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### 3. useRequireAuth Hook

Automatically require authentication for a component.

```typescript
'use client'

import { useRequireAuth } from '@/contexts/AuthContext'

export default function ProtectedPage() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  // At this point, user is guaranteed to be authenticated
  return <div>Welcome to the protected page, {user.email}!</div>
}
```

## Authentication Methods

### Sign Up

```typescript
import { useAuth } from '@/contexts/AuthContext'

function SignUpForm() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await signUp(email, password)

    if (error) {
      console.error('Sign up error:', error.message)
      // Show error to user
    } else {
      console.log('Sign up successful! Check your email for confirmation.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  )
}
```

### Sign In

```typescript
import { useAuth } from '@/contexts/AuthContext'

function SignInForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await signIn(email, password)

    if (error) {
      console.error('Sign in error:', error.message)
      // Show error to user
    } else {
      console.log('Sign in successful!')
      // Redirect to protected page
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Sign Out

```typescript
import { useAuth } from '@/contexts/AuthContext'

function SignOutButton() {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    const { error } = await signOut()

    if (error) {
      console.error('Sign out error:', error.message)
    } else {
      console.log('Signed out successfully!')
      // Redirect to home page
    }
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

## Server-Side Auth Utilities

Use these functions in Server Components or API routes.

```typescript
import { requireAuth, getCurrentUser, isAuthenticated } from '@/lib/auth'

// In a Server Component
export default async function ServerPage() {
  // Get current user (or null if not authenticated)
  const user = await getCurrentUser()

  // Check if user is authenticated
  const authenticated = await isAuthenticated()

  // Or require authentication (throws if not authenticated)
  try {
    const user = await requireAuth()
    return <div>Welcome, {user.email}!</div>
  } catch (error) {
    return <div>Please sign in</div>
  }
}
```

## Protected Routes

Routes are automatically protected by middleware. Configure in `src/middleware.ts`:

```typescript
// Protected routes (require authentication)
const protectedRoutes = ['/profile', '/levels', '/game']

// When user tries to access a protected route without auth,
// they are redirected to /auth with a ?redirectTo parameter
```

**Handling Redirects**:

```typescript
// In your auth page (app/auth/page.tsx)
import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await signIn(email, password)

    if (!error) {
      router.push(redirectTo) // Redirect to intended destination
    }
  }

  // ... rest of component
}
```

## Advanced Usage

### Custom Auth Logic

```typescript
import { useAuth } from '@/contexts/AuthContext'

function CustomAuthComponent() {
  const { user, session } = useAuth()

  // Access full user object
  console.log(user?.id)
  console.log(user?.email)
  console.log(user?.created_at)

  // Access session details
  console.log(session?.access_token)
  console.log(session?.expires_at)

  return <div>...</div>
}
```

### Password Reset

```typescript
import { resetPassword } from '@/lib/auth'

async function handlePasswordReset(email: string) {
  const { error } = await resetPassword(email)

  if (error) {
    console.error('Password reset error:', error.message)
  } else {
    console.log('Password reset email sent! Check your inbox.')
  }
}
```

### Update User Info

```typescript
import { updateEmail, updatePassword } from '@/lib/auth'

// Update email
const { error } = await updateEmail('newemail@example.com')

// Update password
const { error } = await updatePassword('newSecurePassword123')
```

## Error Handling

### Common Errors

```typescript
const { error } = await signIn(email, password)

if (error) {
  switch (error.message) {
    case 'Invalid login credentials':
      // Wrong email or password
      break
    case 'Email not confirmed':
      // User hasn't confirmed their email
      break
    case 'User not found':
      // Email doesn't exist
      break
    default:
      // Other error
      console.error(error.message)
  }
}
```

### Graceful Degradation

When Supabase is not configured:

```typescript
const { isConfigured } = useAuth()

if (!isConfigured) {
  return (
    <div>
      Authentication is not configured. Please set up Supabase environment variables.
      See .env.example for details.
    </div>
  )
}
```

## Best Practices

1. **Always handle loading state**:
   ```typescript
   const { user, loading } = useAuth()
   if (loading) return <LoadingSpinner />
   ```

2. **Use useRequireAuth for protected pages**:
   ```typescript
   // Instead of checking user manually
   const { user, loading } = useRequireAuth()
   // user is guaranteed to exist after loading
   ```

3. **Handle errors gracefully**:
   ```typescript
   const { error } = await signIn(email, password)
   if (error) {
     setErrorMessage(error.message)
     return
   }
   ```

4. **Redirect after auth**:
   ```typescript
   const { error } = await signIn(email, password)
   if (!error) {
     router.push('/profile') // Or use redirectTo param
   }
   ```

5. **Show user feedback**:
   ```typescript
   const { error } = await signOut()
   if (!error) {
     toast.success('Signed out successfully!')
   }
   ```

## Testing

### Manual Testing

1. Start dev server: `pnpm run dev`
2. Navigate to auth page
3. Try signing up with a new email
4. Check email for confirmation link
5. Try signing in
6. Try accessing protected routes
7. Try signing out

### Test Credentials (Development)

For development, you can use Supabase's email confirmations or disable email confirmation in Supabase dashboard:

1. Go to Authentication → Providers → Email
2. Disable "Confirm email" for testing
3. Re-enable for production

## Troubleshooting

### "Supabase is not configured" error
- Check that `.env.local` exists with correct values
- Restart dev server after adding env vars

### "Invalid login credentials" error
- Verify email and password are correct
- Check if email is confirmed (if required)
- Try password reset

### Redirects not working
- Check middleware.ts configuration
- Verify protected routes array
- Check for typos in route names

### Session not persisting
- Check browser cookies are enabled
- Check Supabase session settings
- Verify auth.persistSession is true

## Next Steps

After authentication is set up:
- Create login/signup UI (PR #5)
- Add profile management (PR #6)
- Integrate with game state (PR #9)
