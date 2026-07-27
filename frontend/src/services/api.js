import { handleMockApi } from './mockApi'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export function getAuthToken() {
  return localStorage.getItem('trackr_token')
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('trackr_token', token)
  } else {
    localStorage.removeItem('trackr_token')
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      setAuthToken(null)
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Request failed with status ${response.status}`)
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (err) {
    // If backend server is offline or unreachable (e.g. Vercel static deployment),
    // seamlessly fall back to local client-side standalone execution
    if (
      err.name === 'TypeError' ||
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('404') ||
      err.message.includes('500') ||
      err.message.includes('502') ||
      err.message.includes('503')
    ) {
      console.info(`[Trackr API] Unreachable backend at ${API_BASE}. Running client-side standalone mode for: ${endpoint}`)
      return handleMockApi(endpoint, options)
    }
    throw err
  }
}
