// API URL configuration
// In production, set NEXT_PUBLIC_API_URL environment variable in Vercel
// For local development, defaults to localhost:8000
function getApiBaseUrl(): string {
  // Check environment variable first (works in both server and client)
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

  // Server-side (SSR/build): always return localhost for development
  // Never access window or location during SSR/build
  if (typeof window === 'undefined') {
    return 'http://localhost:8000'
  }

  // Client-side only: check if we're on localhost
  // Use try-catch as extra safety
  try {
    if (
      typeof window !== 'undefined' &&
      window.location &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '')
    ) {
      return 'http://localhost:8000'
    }
  } catch {
    // Fallback to localhost if window.location access fails
    return 'http://localhost:8000'
  }

  // Default fallback
  return 'http://localhost:8000'
}

// Lazy initialization to avoid SSR issues
let API_BASE_URL: string | null = null

function getApiBaseUrlLazy(): string {
  if (API_BASE_URL === null) {
    API_BASE_URL = getApiBaseUrl()
  }
  return API_BASE_URL
}

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api.ts:122',
        message: 'request() called',
        data: { endpoint, method: options.method || 'GET' },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {})
    // #endregion
    const token = this.getToken()
    // Build headers as a plain object to avoid HeadersInit typing issues
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    try {
      // Get API URL lazily to avoid SSR issues
      const apiBaseUrl = getApiBaseUrlLazy()

      // Validate API URL is set and not a placeholder
      if (!apiBaseUrl || apiBaseUrl.includes('your-backend-url')) {
        throw new Error(
          'API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable in Vercel.\n\n' +
            'Steps:\n' +
            '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables\n' +
            '2. Add or update NEXT_PUBLIC_API_URL with your backend URL (e.g., https://your-backend.railway.app)\n' +
            '3. Make sure to select "Production", "Preview", and "Development" environments\n' +
            '4. Redeploy your application\n\n' +
            `Current value: ${apiBaseUrl || 'not set'}`
        )
      }

      const fullUrl = `${apiBaseUrl}${endpoint}`

      // Optional health check - run in background without blocking the request
      // Only in development and skip for health endpoint itself
      if (
        process.env.NODE_ENV === 'development' &&
        typeof window !== 'undefined' &&
        endpoint !== '/health'
      ) {
        // Run health check in background without awaiting
        const apiBaseUrl = getApiBaseUrlLazy()
        fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache',
        })
          .then((healthCheck) => {
            if (healthCheck.ok) {
              healthCheck
                .json()
                .then((data) => {
                  console.log('[API] Backend health check passed:', data)
                })
                .catch(() => {})
            } else {
              console.warn(
                '[API] Backend health check returned non-OK status:',
                healthCheck.status
              )
            }
          })
          .catch((healthError) => {
            // Only log if it's a real error, not just browser blocking
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                '[API] Health check failed (non-blocking):',
                healthError instanceof Error
                  ? healthError.message
                  : String(healthError)
              )
            }
          })
      }

      // Build fetch options
      const fetchOptions: RequestInit = {
        ...options,
        headers,
        mode: 'cors',
      }

      // Only add credentials for authenticated requests (not login/register)
      // For login/register, omit credentials to avoid CORS issues
      if (
        token &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/register')
      ) {
        fetchOptions.credentials = 'include'
      } else {
        fetchOptions.credentials = 'omit'
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${options.method || 'GET'} ${fullUrl}`, {
          headers: Object.keys(headers),
          hasToken: !!token,
          credentials: fetchOptions.credentials,
        })
      }

      // Make the fetch request
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api.ts:219',
            message: 'About to call fetch',
            data: {
              fullUrl,
              method: fetchOptions.method,
              hasBody: !!fetchOptions.body,
              credentials: fetchOptions.credentials,
              mode: fetchOptions.mode,
              headersCount: Object.keys(fetchOptions.headers || {}).length,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'F',
          }),
        }
      ).catch(() => {})
      // #endregion
      let response: Response
      try {
        // #region agent log
        const fetchStartTime = Date.now()
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'api.ts:206',
              message: 'Fetch call starting',
              data: { fullUrl, method: fetchOptions.method },
              timestamp: fetchStartTime,
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'F',
            }),
          }
        ).catch(() => {})
        // #endregion
        response = await fetch(fullUrl, fetchOptions)
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'api.ts:224',
              message: 'Fetch succeeded',
              data: {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'G',
            }),
          }
        ).catch(() => {})
        // #endregion
      } catch (fetchError: unknown) {
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'api.ts:227',
              message: 'Fetch catch',
              data: {
                errorName:
                  fetchError instanceof Error
                    ? fetchError.name
                    : typeof fetchError,
                errorMessage:
                  fetchError instanceof Error
                    ? fetchError.message
                    : String(fetchError),
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'post-fix',
              hypothesisId: 'A',
            }),
          }
        ).catch(() => {})
        // #endregion
        // Network error - fetch failed
        const errorMessage =
          fetchError instanceof Error ? fetchError.message : String(fetchError)
        const errorName =
          fetchError instanceof Error ? fetchError.name : 'Unknown'

        const apiBaseUrl = getApiBaseUrlLazy()
        const diagnosticInfo = {
          apiBaseUrl: apiBaseUrl,
          endpoint: endpoint,
          fullUrl: `${apiBaseUrl}${endpoint}`,
          isBrowser: typeof window !== 'undefined',
          hostname:
            typeof window !== 'undefined' &&
            typeof window.location !== 'undefined'
              ? window.location.hostname
              : 'server',
          errorMessage: errorMessage,
          errorName: errorName,
          errorType: typeof fetchError,
          errorString: String(fetchError),
        }

        // Log with proper serialization
        console.error(
          '[API Client] Fetch error:',
          JSON.stringify(diagnosticInfo, null, 2)
        )
        console.error('[API Client] Original error:', fetchError)

        // Provide helpful error message based on error type
        // apiBaseUrl already declared above
        let helpfulMessage = `Cannot connect to backend server at ${apiBaseUrl}.`

        // Check if API URL is a placeholder
        if (apiBaseUrl.includes('your-backend-url')) {
          helpfulMessage =
            `Backend URL is not configured. The API URL is set to a placeholder value.\n\n` +
            `Please set NEXT_PUBLIC_API_URL in Vercel:\n` +
            `1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables\n` +
            `2. Add or update NEXT_PUBLIC_API_URL with your actual backend URL\n` +
            `3. Make sure to select "Production", "Preview", and "Development"\n` +
            `4. Redeploy your application\n\n` +
            `Example: NEXT_PUBLIC_API_URL=https://your-backend.railway.app`
        } else if (
          errorMessage.includes('Load failed') ||
          errorMessage.includes('Failed to fetch')
        ) {
          helpfulMessage +=
            `\n\nThis "Load failed" error is often caused by:\n` +
            `1. Backend server is not running or not accessible\n` +
            `2. CORS configuration issue (verify backend CORS allows your Vercel domain)\n` +
            `3. Network/firewall blocking the connection\n` +
            `4. Backend URL is incorrect\n\n` +
            `Full URL attempted: ${apiBaseUrl}${endpoint}\n` +
            `Error: ${errorMessage} (${errorName})`
        } else {
          helpfulMessage += ` Make sure the backend is running and accessible.\nFull URL: ${apiBaseUrl}${endpoint}\nError: ${errorMessage} (${errorName})`
        }

        throw new Error(helpfulMessage)
      }

      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api.ts:265',
            message: 'Checking response.ok',
            data: { responseOk: response.ok, responseStatus: response.status },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'post-fix',
            hypothesisId: 'B',
          }),
        }
      ).catch(() => {})
      // #endregion
      if (!response.ok) {
        // 405 specifically means Method Not Allowed - likely wrong endpoint
        if (response.status === 405) {
          const apiBaseUrl = getApiBaseUrlLazy()
          throw new Error(
            `Method not allowed (405). The request went to: ${fullUrl}. ` +
              `Make sure NEXT_PUBLIC_API_URL is set to your Railway backend URL in Vercel environment variables. ` +
              `Current API URL: ${apiBaseUrl || 'NOT SET'}`
          )
        }

        // Try to get error details from response
        let error: { detail?: string | unknown[]; message?: string }
        try {
          const errorText = await response.text()
          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'api.ts:280',
                message: 'Error response body',
                data: {
                  status: response.status,
                  errorText: errorText.substring(0, 500),
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'G',
              }),
            }
          ).catch(() => {})
          // #endregion
          try {
            error = JSON.parse(errorText)
          } catch {
            error = {
              detail: errorText || `HTTP error! status: ${response.status}`,
            }
          }
        } catch {
          error = {
            detail: `HTTP error! status: ${response.status}`,
          }
        }

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
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api.ts:293',
            message: 'Outer catch - non-network error',
            data: {
              errorName: error instanceof Error ? error.name : typeof error,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'post-fix',
            hypothesisId: 'A',
          }),
        }
      ).catch(() => {})
      // #endregion
      // Re-throw errors that were already handled (network errors are handled above)
      // This catch only handles JSON parsing errors and other unexpected errors
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

  async deleteClient(clientId: string): Promise<{
    message: string
    deleted_email: string
    deleted_company: string
  }> {
    return this.request<{
      message: string
      deleted_email: string
      deleted_company: string
    }>(`/api/admin/clients/${clientId}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()
