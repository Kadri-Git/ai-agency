'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Settings } from 'lucide-react'
import { api } from '@/lib/api'

interface ConnectGA4Props {
  hasCredentials: boolean
}

export function ConnectGA4({ hasCredentials }: ConnectGA4Props) {
  const router = useRouter()
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (hasCredentials) {
      const fetchProperty = async () => {
        try {
          const status = await api.getGA4Status()
          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'ConnectGA4.tsx:fetchProperty',
                message: 'GA4 status in ConnectGA4 component',
                data: {
                  hasCredentials: status.has_credentials,
                  propertyId: status.ga4_property_id,
                  connectionType: status.connection_type,
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'ga-status-check',
                hypothesisId: 'GA_STATUS',
              }),
            }
          ).catch(() => {})
          // #endregion
          setCurrentPropertyId(status.ga4_property_id)
        } catch (error) {
          console.error('Failed to fetch GA4 property:', error)
          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'ConnectGA4.tsx:fetchProperty:error',
                message: 'Failed to fetch GA4 status',
                data: {
                  errorName: error instanceof Error ? error.name : typeof error,
                  errorMessage:
                    error instanceof Error ? error.message : String(error),
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'ga-status-check',
                hypothesisId: 'GA_STATUS',
              }),
            }
          ).catch(() => {})
          // #endregion
        }
      }
      fetchProperty()
    }
  }, [hasCredentials])

  if (hasCredentials) {
    return (
      <div className="mb-4">
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <CardTitle className="text-base">GA4 Connected</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/connect-analytics')}
                className="h-8"
              >
                <Settings className="h-3 w-3 mr-1.5" />
                Change Property
              </Button>
            </div>
            <CardDescription className="text-sm mt-1">
              {currentPropertyId ? (
                <>
                  Property ID:{' '}
                  <span className="font-mono text-xs">{currentPropertyId}</span>
                </>
              ) : (
                'Your Google Analytics 4 account is connected and active'
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-base">Connect GA4 Account</CardTitle>
          </div>
          <CardDescription className="text-sm mt-1">
            Connect your Google Analytics 4 account to see real data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            type="button"
            onClick={() => router.push('/connect-analytics')}
            className="w-full"
            size="sm"
          >
            Connect with Google
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Easy OAuth2 connection - no JSON files needed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
