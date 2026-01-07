// API URL configuration
// In production, set NEXT_PUBLIC_API_URL environment variable in Vercel
// For local development, defaults to localhost:8000
function getApiBaseUrl(): string {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    let url = process.env.NEXT_PUBLIC_API_URL.trim()

    // Remove trailing slash if present
    url = url.replace(/\/$/, '')

    // Auto-add https:// if protocol is missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }

    return url
  }

  // In browser, check if we're on localhost
  if (typeof window !== 'undefined') {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      return 'http://localhost:8000'
    }
  }

  // Fallback: return empty string (will cause clear error)
  return ''
}

const API_BASE_URL = getApiBaseUrl()

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  company_name: string
}

export interface UpdateGA4CredentialsRequest {
  ga4_property_id: string
  ga4_service_account_json: string
}

export interface GA4StatusResponse {
  has_credentials: boolean
  ga4_property_id: string | null
}

export interface ClientSummary {
  id: string
  email: string
  company_name: string
  has_ga4: boolean
  is_demo: boolean
  is_active: boolean
  created_at: string
  ai_sessions: number
  ai_revenue: number
  ai_conversion_rate: number
}

export interface ClientsListResponse {
  clients: ClientSummary[]
  total: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface AITrafficMetrics {
  ai_sessions: number
  ai_revenue: number
  ai_conversion_rate: number
  ai_average_order_value: number
  ai_revenue_per_session: number
  site_avg_conversion_rate: number
  ai_vs_site_conversion_rate: number
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
}

export interface TopLandingPage {
  page_path: string
  sessions: number
  revenue: number
  conversion_rate: number
}

export interface DashboardData {
  metrics: AITrafficMetrics
  revenue_trend: {
    data: RevenueTrendPoint[]
  }
  top_landing_pages: TopLandingPage[]
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    // Build headers as a plain object to avoid HeadersInit typing issues
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    try {
      // Validate API URL is set
      if (!API_BASE_URL) {
        throw new Error(
          'API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable in Vercel. ' +
            'Go to Vercel Dashboard → Settings → Environment Variables → Add NEXT_PUBLIC_API_URL with your Railway backend URL.'
        )
      }

      const fullUrl = `${API_BASE_URL}${endpoint}`

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${options.method || 'GET'} ${fullUrl}`)
      }

      const response = await fetch(fullUrl, {
        ...options,
        headers,
      })

      if (!response.ok) {
        // 405 specifically means Method Not Allowed - likely wrong endpoint
        if (response.status === 405) {
          throw new Error(
            `Method not allowed (405). The request went to: ${fullUrl}. ` +
              `Make sure NEXT_PUBLIC_API_URL is set to your Railway backend URL in Vercel environment variables. ` +
              `Current API URL: ${API_BASE_URL || 'NOT SET'}`
          )
        }

        const error = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }))
        // Handle validation errors from FastAPI
        if (error.detail && Array.isArray(error.detail)) {
          const firstError = error.detail[0]
          throw new Error(
            firstError.msg || firstError.message || JSON.stringify(error.detail)
          )
        }
        throw new Error(
          error.detail ||
            error.message ||
            `HTTP error! status: ${response.status}. Request URL: ${fullUrl}`
        )
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to backend server at ${API_BASE_URL}. ` +
            `Make sure the backend is running: cd backend && uvicorn main:app --reload`
        )
      }
      throw error
    }
  }

  async login(data: LoginRequest): Promise<TokenResponse> {
    return this.request<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async register(data: RegisterRequest): Promise<TokenResponse> {
    return this.request<TokenResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getDashboardMetrics(days: number = 30): Promise<DashboardData> {
    return this.request<DashboardData>(`/api/dashboard/metrics?days=${days}`)
  }

  async updateGA4Credentials(
    data: UpdateGA4CredentialsRequest
  ): Promise<{ message: string; ga4_property_id: string }> {
    return this.request<{ message: string; ga4_property_id: string }>(
      '/api/settings/ga4-credentials',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    )
  }

  async getGA4Status(): Promise<GA4StatusResponse> {
    return this.request<GA4StatusResponse>('/api/settings/ga4-status')
  }

  async changePassword(data: {
    current_password: string
    new_password: string
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/settings/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Admin endpoints
  async getClientsList(): Promise<ClientsListResponse> {
    return this.request<ClientsListResponse>('/api/admin/clients')
  }

  async getClientDashboard(
    clientId: string,
    days: number = 30
  ): Promise<DashboardData> {
    return this.request<DashboardData>(
      `/api/admin/clients/${clientId}/dashboard?days=${days}`
    )
  }
}

export const api = new ApiClient()
