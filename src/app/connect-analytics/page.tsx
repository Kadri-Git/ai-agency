'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

interface GA4Property {
  propertyId: string
  displayName: string
  account: string
}

export default function ConnectAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<GA4Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(
    null
  )

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await api.getGA4Status()
        if (status.has_credentials) {
          setIsConnected(true)
          setCurrentPropertyId(status.ga4_property_id)
        }
      } catch {
        // Not connected yet
      }
    }
    checkConnection()
  }, [])

  const fetchProperties = useCallback(async () => {
    if (!session?.accessToken) {
      return
    }

    setIsLoadingProperties(true)
    try {
      const response = await fetch('/api/google-analytics/properties', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        // If re-authentication is required, sign out and redirect to sign in
        if (response.status === 401 && errorData.requiresReauth) {
          await signOut({ redirect: false })
          toast.error('Your session has expired. Please sign in again.')
          router.push('/connect-analytics')
          return
        }

        throw new Error(errorData.error || 'Failed to fetch properties')
      }

      const data = await response.json()
      setProperties(data.properties || [])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load GA4 properties'
      )
    } finally {
      setIsLoadingProperties(false)
    }
  }, [session, router])

  // Fetch properties when authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && !isConnected) {
      fetchProperties()
    }
  }, [status, session, isConnected, fetchProperties])

  const handleConnect = async () => {
    if (!selectedProperty || !session?.accessToken) return

    // Check if user is logged into the app
    const authToken =
      useAuthStore.getState().token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null)
    if (!authToken) {
      toast.error('Please log in to the app first before connecting GA4')
      router.push('/login')
      return
    }

    setIsConnecting(true)
    try {
      const response = await fetch('/api/client/save-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          email: session.user?.email,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt,
          authToken: authToken, // Our app's JWT token
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText || `HTTP ${response.status}` }
        }

        throw new Error(
          error.message || error.error || 'Failed to connect property'
        )
      }

      toast.success('GA4 property connected successfully!')

      // Refresh status to get the new property ID
      const status = await api.getGA4Status()
      setIsConnected(true)
      setCurrentPropertyId(status.ga4_property_id)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to connect property'
      )
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    setProperties([])
    setSelectedProperty('')
    setIsConnected(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle>GA4 Already Connected</CardTitle>
            </div>
            <CardDescription className="mt-2">
              {currentPropertyId ? (
                <>
                  Current Property ID:{' '}
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {currentPropertyId}
                  </span>
                </>
              ) : (
                'Your Google Analytics account is already connected.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => {
                setIsConnected(false)
                setCurrentPropertyId(null)
                fetchProperties()
              }}
              className="w-full"
              variant="outline"
            >
              Change Property
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Google Analytics</CardTitle>
            <CardDescription>
              Connect your GA4 account to view AI visibility metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => signIn('google')}
              className="w-full"
              size="lg"
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Connect with Google
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By connecting, you grant read-only access to your Google Analytics
              data
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select GA4 Property</CardTitle>
              <CardDescription className="mt-1">
                Choose which Google Analytics property to connect
              </CardDescription>
            </div>
            {session?.user?.email && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {session.user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 w-8 p-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingProperties ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading properties...
              </span>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No GA4 properties found. Make sure you have access to at least
                one GA4 property.
              </p>
              <Button
                variant="outline"
                onClick={fetchProperties}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="ga4-property-select"
                  className="text-sm font-medium"
                >
                  GA4 Property
                </label>
                <Select
                  value={selectedProperty}
                  onValueChange={setSelectedProperty}
                >
                  <SelectTrigger id="ga4-property-select">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem
                        key={property.propertyId}
                        value={property.propertyId}
                      >
                        {property.displayName} ({property.propertyId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleConnect}
                disabled={!selectedProperty || isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect This Property'
                )}
              </Button>
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                  size="sm"
                >
                  Skip for Now (Use Sample Data)
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You can connect GA4 later from the dashboard
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
