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
import { motion } from 'motion/react'
import { Search, Loader2, Globe, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface AnalysisFormProps {
  onAnalysisStart?: (analysisId: string, domain: string) => void
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
  { value: 'ee', label: 'Estonia' },
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
    // Remove leading/trailing whitespace
    let cleaned = urlString.trim()
    
    // Remove protocol if present
    cleaned = cleaned.replace(/^https?:\/\//, '')
    
    // Remove www. prefix if present
    cleaned = cleaned.replace(/^www\./, '')
    
    // Remove trailing slashes and paths
    cleaned = cleaned.split('/')[0]
    
    // Remove trailing dots
    cleaned = cleaned.replace(/\.+$/, '')
    
    // If it's a partial domain like "www.andres..." or "andres...", 
    // we'll use it as-is (the user might be typing)
    return cleaned || urlString.trim()
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
      // Automatically prepend https:// if not present
      const urlWithProtocol = url.trim().startsWith('http://') || url.trim().startsWith('https://') 
        ? url.trim() 
        : `https://${url.trim()}`
      
      const domain = extractDomain(urlWithProtocol)
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
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json()
          const errorMessage = error.error || error.details || 'Failed to start analysis'
          throw new Error(errorMessage)
        } else {
          const text = await response.text()
          throw new Error(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 200)}`)
        }
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server')
      }

      const data = await response.json()
      toast.success('Analysis started successfully!')
      
      if (onAnalysisStart) {
        onAnalysisStart(data.id, domain)
      }
      
      // Store domain for future page loads
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastAnalyzedDomain', domain)
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
      <div className="">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-black">
            <Search className="h-6 w-6 text-primary" />
            Analyze Your Company
          </h2>
          <p className="text-base text-black mt-2">
            Enter your company URL and region to analyze your AI visibility across major platforms
          </p>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2 text-black">
                <Globe className="h-4 w-4" />
                Company URL
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none">
                  https://
                </span>
                <Input
                  id="url"
                  type="text"
                  placeholder="www.example.com or example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-base pl-20"
                  required
                />
              </div>
              <p className="text-xs text-black">
                Enter your company domain (https:// is automatically added)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm font-semibold flex items-center gap-2 text-black">
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
                <p className="text-xs text-black">
                  Primary market for analysis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-semibold text-black">
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
                <p className="text-xs text-black">
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
        </div>
      </div>
    </motion.div>
  )
}


