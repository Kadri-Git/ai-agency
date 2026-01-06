// API URL configuration
// In production, set NEXT_PUBLIC_API_URL environment variable in Vercel
// For local development, defaults to localhost:8000
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : '') // Will use environment variable in production

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  company_name: string
  ga4_property_id?: string
  ga4_service_account_json?: string
  is_demo?: boolean
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
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
            `HTTP error! status: ${response.status}`
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
}

export const api = new ApiClient()
