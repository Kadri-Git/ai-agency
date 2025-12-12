'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { Search, Loader2, Globe, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface AnalysisFormProps {
  onAnalysisStart?: (analysisId: string) => void
}

const regions = [
  { value: 'global', label: 'Global' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'se', label: 'Sweden' },
  { value: 'no', label: 'Norway' },
  { value: 'dk', label: 'Denmark' },
  { value: 'fi', label: 'Finland' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
  { value: 'in', label: 'India' },
  { value: 'br', label: 'Brazil' },
  { value: 'mx', label: 'Mexico' },
  { value: 'za', label: 'South Africa' },
]

export function AnalysisForm({ onAnalysisStart }: AnalysisFormProps) {
  const [url, setUrl] = useState('')
  const [region, setRegion] = useState('global')
  const [industry, setIndustry] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const extractDomain = (urlString: string): string => {
    try {
      const urlObj = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`)
      return urlObj.hostname.replace('www.', '')
    } catch {
      // If URL parsing fails, try to extract domain manually
      const cleaned = urlString.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      return cleaned
    }
  }

  const extractCompanyName = (domain: string): string => {
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setIsLoading(true)

    try {
      const domain = extractDomain(url)
      const companyName = extractCompanyName(domain)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companyName,
          domain,
          industry: industry || undefined,
          config: {
            region,
            targetRegions: [region],
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start analysis')
      }

      const data = await response.json()
      toast.success('Analysis started successfully!')
      
      if (onAnalysisStart) {
        onAnalysisStart(data.id)
      }

      // Reset form
      setUrl('')
      setIndustry('')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to start analysis. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-blue-50/50 dark:from-card dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Analyze Your Company
          </CardTitle>
          <CardDescription className="text-base">
            Enter your company URL and region to analyze your AI visibility across major platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Company URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com or example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your company website URL (with or without https://)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Target Region
                </Label>
                <Select value={region} onValueChange={setRegion} disabled={isLoading}>
                  <SelectTrigger id="region" className="h-12">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((reg) => (
                      <SelectItem key={reg.value} value={reg.value}>
                        {reg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Primary market for analysis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-semibold">
                  Industry (Optional)
                </Label>
                <Input
                  id="industry"
                  type="text"
                  placeholder="e.g., SaaS, E-commerce, Healthcare"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Helps generate more relevant queries
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Start Analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

