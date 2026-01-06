'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api, RegisterRequest } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    company_name: '',
    ga4_property_id: '',
    ga4_service_account_json: '',
    is_demo: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        is_demo: isDemoMode,
      }

      // If not demo mode, validate GA4 credentials
      if (!isDemoMode) {
        if (!submitData.ga4_property_id || !submitData.ga4_service_account_json) {
          throw new Error('GA4 credentials are required when not in demo mode')
        }
        // Validate JSON
        try {
          JSON.parse(submitData.ga4_service_account_json!)
        } catch {
          throw new Error('GA4 service account JSON is invalid')
        }
      }

      const response = await api.register(submitData)
      setAuth(response.access_token, formData.email, isDemoMode)
      toast.success(isDemoMode ? 'Demo account created! Using mock data.' : 'Account created successfully!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Create an account to access your AI Shopping Visibility dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <Checkbox
                id="demo-mode"
                checked={isDemoMode}
                onCheckedChange={(checked) => {
                  setIsDemoMode(checked === true)
                  if (checked) {
                    setFormData({
                      ...formData,
                      ga4_property_id: '',
                      ga4_service_account_json: '',
                    })
                  }
                }}
              />
              <label
                htmlFor="demo-mode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Use Demo Mode (No GA4 credentials required - uses mock data)
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                required
              />
            </div>
            {!isDemoMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ga4_property_id">GA4 Property ID</Label>
                  <Input
                    id="ga4_property_id"
                    placeholder="123456789"
                    value={formData.ga4_property_id}
                    onChange={(e) =>
                      setFormData({ ...formData, ga4_property_id: e.target.value })
                    }
                    required={!isDemoMode}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this in Google Analytics: Admin → Property Settings → Property ID
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ga4_service_account_json">GA4 Service Account JSON</Label>
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
                    required={!isDemoMode}
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a service account in Google Cloud Console and download the JSON key file.
                    Paste the entire JSON content here.
                  </p>
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

