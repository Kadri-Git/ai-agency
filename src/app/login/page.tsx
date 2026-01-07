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
      // Decode JWT to check if demo mode (simple check - in production use proper JWT decode)
      // For now, we'll check the email or decode the token
      const tokenParts = response.access_token.split('.')
      let isDemo = false
      let isAdmin = false
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]))
          isDemo = payload.is_demo === true
          isAdmin = payload.is_admin === true
        } catch {
          // Fallback: check email
          isDemo = formData.email.toLowerCase().includes('demo')
        }
      }
      setAuth(response.access_token, formData.email, isDemo, isAdmin)

      // Redirect admin to admin dashboard
      if (isAdmin) {
        router.push('/admin')
        return
      }
      toast.success('Logged in successfully!')
      router.push('/dashboard')
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
        setAuth(response.access_token, demoEmail, isDemo, isAdmin)

        // Redirect admin to admin dashboard
        if (isAdmin) {
          router.push('/admin')
          return
        }
        toast.success('Demo account logged in!')
        router.push('/dashboard')
        return
      } catch (loginError) {
        // If login fails, try to register
        console.log('Login failed, trying to register:', loginError)
      }

      // Try to register
      try {
        const response = await api.register({
          email: demoEmail,
          password: demoPassword,
          company_name: 'Demo Company',
        })
        // All accounts start without GA4, so they'll see sample data
        const tokenParts = response.access_token.split('.')
        let isAdmin = false
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]))
            isAdmin = payload.is_admin === true
          } catch {
            // Ignore
          }
        }
        setAuth(response.access_token, demoEmail, false, isAdmin)

        // Redirect admin to admin dashboard
        if (isAdmin) {
          router.push('/admin')
          return
        }
        toast.success('Demo account created and logged in!')
        router.push('/dashboard')
      } catch (registerError) {
        // If registration fails, it might be because account exists with wrong password
        // Try to show a more helpful error
        const errorMessage =
          registerError instanceof Error
            ? registerError.message
            : 'Failed to setup demo account'

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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
