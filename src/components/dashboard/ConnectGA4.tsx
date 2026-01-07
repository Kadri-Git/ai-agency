'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api, UpdateGA4CredentialsRequest } from '@/lib/api'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface ConnectGA4Props {
  onConnected: () => void
  hasCredentials: boolean
}

export function ConnectGA4({ onConnected, hasCredentials }: ConnectGA4Props) {
  const [isOpen, setIsOpen] = useState(!hasCredentials)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateGA4CredentialsRequest>({
    ga4_property_id: '',
    ga4_service_account_json: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate JSON
      try {
        JSON.parse(formData.ga4_service_account_json)
      } catch {
        throw new Error('Invalid GA4 service account JSON')
      }

      await api.updateGA4Credentials(formData)
      toast.success('GA4 credentials connected successfully!')
      setIsOpen(false)
      onConnected()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to connect GA4'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Collapsed state when credentials exist
  if (hasCredentials && !isOpen) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between p-3 text-sm border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-muted-foreground">GA4 Connected</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasCredentials ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
              <CardTitle className="text-base">
                {hasCredentials ? 'GA4 Settings' : 'Connect GA4 Account'}
              </CardTitle>
            </div>
            {hasCredentials && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!hasCredentials && (
            <CardDescription className="text-sm mt-1">
              Connect your Google Analytics 4 account to see real data
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ga4_property_id" className="text-sm">
                GA4 Property ID
              </Label>
              <Input
                id="ga4_property_id"
                placeholder="123456789"
                value={formData.ga4_property_id}
                onChange={(e) =>
                  setFormData({ ...formData, ga4_property_id: e.target.value })
                }
                className="h-9"
                required
              />
              <p className="text-xs text-muted-foreground">
                Admin → Property Settings → Property ID
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ga4_service_account_json" className="text-sm">
                Service Account JSON
              </Label>
              <Textarea
                id="ga4_service_account_json"
                placeholder='{"type": "service_account", ...}'
                value={formData.ga4_service_account_json}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ga4_service_account_json: e.target.value,
                  })
                }
                className="font-mono text-xs"
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Download JSON key from Google Cloud Console
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading
                  ? 'Connecting...'
                  : hasCredentials
                    ? 'Update'
                    : 'Connect'}
              </Button>
              {hasCredentials && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
