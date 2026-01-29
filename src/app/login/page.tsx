'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api, LoginRequest } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.login(formData)
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'login/page.tsx:34',
            message: 'Login response received',
            data: {
              hasToken: !!response.access_token,
              tokenLength: response.access_token?.length,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        }
      ).catch(() => {})
      // #endregion
      // Decode JWT to check if demo mode (simple check - in production use proper JWT decode)
      // For now, we'll check the email or decode the token
      const tokenParts = response.access_token.split('.')
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'login/page.tsx:38',
            message: 'JWT split result',
            data: { tokenPartsLength: tokenParts.length },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        }
      ).catch(() => {})
      // #endregion
      let isDemo = false
      let isAdmin = false
      if (tokenParts.length === 3) {
        try {
          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'login/page.tsx:42',
                message: 'Attempting JWT decode',
                data: { payloadLength: tokenParts[1]?.length },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'D',
              }),
            }
          ).catch(() => {})
          // #endregion
          const payload = JSON.parse(atob(tokenParts[1]))
          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'login/page.tsx:44',
                message: 'JWT decode succeeded',
                data: { isDemo: payload.is_demo, isAdmin: payload.is_admin },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'D',
              }),
            }
          ).catch(() => {})
          // #endregion
          isDemo = payload.is_demo === true
          isAdmin = payload.is_admin === true
        } catch (decodeError) {
          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'login/page.tsx:48',
                message: 'JWT decode failed',
                data: {
                  errorName:
                    decodeError instanceof Error
                      ? decodeError.name
                      : typeof decodeError,
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'D',
              }),
            }
          ).catch(() => {})
          // #endregion
          // Fallback: check email
          isDemo = formData.email.toLowerCase().includes('demo')
        }
      }
      setAuth(response.access_token, formData.email, isDemo, isAdmin)

      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'login/page.tsx:afterSetAuth',
            message: 'Auth state after setAuth',
            data: {
              storeState: {
                isAuthenticated: useAuthStore.getState().isAuthenticated,
                hasToken: !!useAuthStore.getState().token,
                email: useAuthStore.getState().email,
              },
              hasLocalStorageToken:
                typeof window !== 'undefined'
                  ? !!localStorage.getItem('auth_token')
                  : null,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'LOGIN_REDIRECT',
          }),
        }
      ).catch(() => {})
      // #endregion

      // Redirect admin to admin dashboard
      if (isAdmin) {
        toast.success('Logged in successfully!')
        if (typeof window !== 'undefined') {
          window.location.href = '/admin'
        } else {
          router.replace('/admin')
        }
        return
      }
      toast.success('Logged in successfully!')
      // Use window.location for a hard redirect to ensure auth state is recognized
      // This avoids race conditions with Zustand store updates
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard'
      } else {
        router.replace('/dashboard')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      // Try to login with demo credentials, or register if doesn't exist
      const demoEmail = 'demo@example.com'
      const demoPassword = 'demo123'

      try {
        const response = await api.login({
          email: demoEmail,
          password: demoPassword,
        })
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'login/page.tsx:handleDemoLogin:loginSuccess',
              message: 'Demo login via /api/auth/login succeeded',
              data: {
                email: demoEmail,
                hasToken: !!response.access_token,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'demo-run',
              hypothesisId: 'DL1',
            }),
          }
        ).catch(() => {})
        // #endregion
        const tokenParts = response.access_token.split('.')
        let isDemo = false
        let isAdmin = false
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]))
            isDemo = payload.is_demo === true
            isAdmin = payload.is_admin === true
          } catch {
            isDemo = true // Assume demo if we can't decode
          }
        }
        // For demo mode we always want a non-admin demo experience
        isDemo = true
        isAdmin = false
        setAuth(response.access_token, demoEmail, isDemo, isAdmin)

        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'login/page.tsx:handleDemoLogin:afterSetAuth',
              message: 'Demo auth state after setAuth',
              data: {
                storeState: {
                  isAuthenticated: useAuthStore.getState().isAuthenticated,
                  hasToken: !!useAuthStore.getState().token,
                },
                hasLocalStorageToken:
                  typeof window !== 'undefined'
                    ? !!localStorage.getItem('auth_token')
                    : null,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'demo-run',
              hypothesisId: 'DL6',
            }),
          }
        ).catch(() => {})
        // #endregion

        // Redirect admin to admin dashboard
        toast.success('Demo account logged in!')
        router.push('/dashboard')
        return
      } catch (loginError) {
        // If login fails, try to register
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'login/page.tsx:handleDemoLogin:loginError',
              message: 'Demo login via /api/auth/login failed',
              data: {
                errorName:
                  loginError instanceof Error
                    ? loginError.name
                    : typeof loginError,
                errorMessage:
                  loginError instanceof Error
                    ? loginError.message
                    : String(loginError),
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'demo-run',
              hypothesisId: 'DL1',
            }),
          }
        ).catch(() => {})
        // #endregion
      }

      // Try to register
      try {
        const response = await api.register({
          email: demoEmail,
          password: demoPassword,
          company_name: 'Demo Company',
        })
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'login/page.tsx:handleDemoLogin:registerSuccess',
              message: 'Demo register via /api/auth/register succeeded',
              data: {
                email: demoEmail,
                hasToken: !!response.access_token,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'demo-run',
              hypothesisId: 'DL1',
            }),
          }
        ).catch(() => {})
        // #endregion
        // All accounts start without GA4, so they'll see sample data
        // For demo mode we always want a non-admin demo experience
        setAuth(response.access_token, demoEmail, true, false)

        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'login/page.tsx:handleDemoLogin:afterSetAuth:register',
              message: 'Demo auth state after setAuth (register path)',
              data: {
                storeState: {
                  isAuthenticated: useAuthStore.getState().isAuthenticated,
                  hasToken: !!useAuthStore.getState().token,
                },
                hasLocalStorageToken:
                  typeof window !== 'undefined'
                    ? !!localStorage.getItem('auth_token')
                    : null,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'demo-run',
              hypothesisId: 'DL6',
            }),
          }
        ).catch(() => {})
        // #endregion

        toast.success('Demo account created and logged in!')
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        } else {
          router.replace('/dashboard')
        }
      } catch (registerError) {
        // If registration fails, it might be because account exists with wrong password
        // Try to show a more helpful error
        const errorMessage =
          registerError instanceof Error
            ? registerError.message
            : 'Failed to setup demo account'

        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'login/page.tsx:handleDemoLogin:registerError',
              message: 'Demo register via /api/auth/register failed',
              data: {
                errorName:
                  registerError instanceof Error
                    ? registerError.name
                    : typeof registerError,
                errorMessage,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'demo-run',
              hypothesisId: 'DL1',
            }),
          }
        ).catch(() => {})
        // #endregion

        if (errorMessage.includes('already registered')) {
          toast.error(
            'Demo account exists but password is incorrect. Please use the register page to create a new demo account.'
          )
        } else {
          toast.error(`Failed to setup demo account: ${errorMessage}`)
        }
        console.error('Registration error:', registerError)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to setup demo account'

      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'login/page.tsx:handleDemoLogin:catch',
            message: 'Demo login failed',
            data: {
              errorName: error instanceof Error ? error.name : typeof error,
              errorMessage: errorMessage,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'demo-run',
            hypothesisId: 'DL1',
          }),
        }
      ).catch(() => {})
      // #endregion

      toast.error(`Failed to setup demo account: ${errorMessage}`)
      console.error('Demo login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Sign in to your AI Shopping Visibility dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            suppressHydrationWarning
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                suppressHydrationWarning
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Try Demo Mode (No Setup Required)'}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{' '}
            </span>
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
