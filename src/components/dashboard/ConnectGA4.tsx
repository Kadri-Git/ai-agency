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
import { CheckCircle2, AlertCircle } from 'lucide-react'

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

  if (hasCredentials && !isOpen) {
    return (
      <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  GA4 Connected
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your dashboard is showing real GA4 data
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
              Update Credentials
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <CardTitle className="text-amber-900 dark:text-amber-100">
              Connect Your GA4 Account
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Connect your Google Analytics 4 account to see real data. Until
              then, you&apos;ll see sample data.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga4_property_id">GA4 Property ID</Label>
            <Input
              id="ga4_property_id"
              placeholder="123456789"
              value={formData.ga4_property_id}
              onChange={(e) =>
                setFormData({ ...formData, ga4_property_id: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Find this in Google Analytics: Admin → Property Settings →
              Property ID
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ga4_service_account_json">
              GA4 Service Account JSON
            </Label>
            <Textarea
              id="ga4_service_account_json"
              placeholder='{"type": "service_account", "project_id": "...", ...}'
              value={formData.ga4_service_account_json}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ga4_service_account_json: e.target.value,
                })
              }
              className="font-mono text-sm"
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              Create a service account in Google Cloud Console and download the
              JSON key file. Paste the entire JSON content here.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect GA4'}
            </Button>
            {hasCredentials && (
              <Button
                type="button"
                variant="outline"
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
  )
}
