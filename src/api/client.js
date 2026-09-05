const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const SESSION_KEY = 'daily-study-auth'

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? null
    this.code = options.code ?? null
    this.payload = options.payload ?? null
    this.errorDetails = options.errorDetails ?? null
    this.requestId = options.requestId ?? null
    this.timestamp = options.timestamp ?? null
  }
}

export const getAuthSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export const setAuthSession = (session) => localStorage.setItem(
  SESSION_KEY,
  JSON.stringify({ ...getAuthSession(), ...session })
)
export const clearAuthSession = () => localStorage.removeItem(SESSION_KEY)
export const isAuthenticated = () => Boolean(getAuthSession()?.token)
export const isAdmin = () => {
  const session = getAuthSession()
  return Boolean(session?.token) && session?.role === 'ADMIN'
}

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export const buildApiUrl = (path, params) => {
  if (!API_BASE_URL) throw new ApiError('缺少 VITE_API_BASE_URL 环境配置，请在本地 .env 中设置后端地址')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}${buildQuery(params)}`
}

const parseResponse = async (response) => {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  return (await response.text()) || null
}

const assertSuccessfulPayload = (payload, response) => {
  if (!response.ok || (payload && typeof payload === 'object' && 'code' in payload && payload.code !== 200)) {
    throw new ApiError(payload?.message || `请求失败（HTTP ${response.status}）`, {
      status: response.status,
      code: payload?.code,
      payload,
      errorDetails: payload?.errorDetails,
      requestId: payload?.requestId,
      timestamp: payload?.timestamp
    })
  }
  return payload
}

let refreshPromise = null
const refreshAccessToken = async () => {
  const refreshToken = getAuthSession()?.refreshToken
  if (!refreshToken) throw new ApiError('登录状态已失效，请重新登录', { status: 401 })
  if (!refreshPromise) {
    refreshPromise = fetch(buildApiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    }).then(async (response) => {
      const payload = assertSuccessfulPayload(await parseResponse(response), response)
      setAuthSession({ token: payload.token, expiresIn: payload.expiresIn })
      return payload.token
    }).finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', params, body, signal, headers: extraHeaders = {}, auth = true, retry = true, timeout = 15000 } = options
  const headers = { Accept: 'application/json', ...extraHeaders }
  const token = getAuthSession()?.token
  if (auth && token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'

  const requestController = new AbortController()
  let timedOut = false
  const forwardAbort = () => requestController.abort(signal?.reason)
  if (signal?.aborted) forwardAbort()
  else signal?.addEventListener('abort', forwardAbort, { once: true })
  const timeoutId = Number(timeout) > 0
    ? setTimeout(() => {
        timedOut = true
        requestController.abort()
      }, Number(timeout))
    : null

  let response
  try {
    response = await fetch(buildApiUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: requestController.signal
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      if (timedOut) throw new ApiError('请求超时，请检查后端服务是否可用')
      throw error
    }
    throw new ApiError('无法连接到服务器，请检查后端服务与 VITE_API_BASE_URL 配置', { payload: error })
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    signal?.removeEventListener('abort', forwardAbort)
  }

  const payload = await parseResponse(response)
  const unauthorized = response.status === 401 || payload?.code === 401
  if (unauthorized && auth && retry && getAuthSession()?.refreshToken) {
    try {
      await refreshAccessToken()
      return apiRequest(path, { ...options, retry: false })
    } catch (error) {
      clearAuthSession()
      window.dispatchEvent(new CustomEvent('daily-study:auth-expired'))
      throw error
    }
  }
  if (unauthorized && auth) {
    clearAuthSession()
    window.dispatchEvent(new CustomEvent('daily-study:auth-expired'))
  }
  const forbidden = response.status === 403 || payload?.code === 403
  if (forbidden && auth) {
    window.dispatchEvent(new CustomEvent('daily-study:admin-forbidden'))
  }

  return assertSuccessfulPayload(payload, response)
}

export const unwrapData = (payload) => payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
export const apiGet = (path, options = {}) => apiRequest(path, { ...options, method: 'GET' })
export const apiPost = (path, body, options = {}) => apiRequest(path, { ...options, method: 'POST', body })
export const apiPut = (path, body, options = {}) => apiRequest(path, { ...options, method: 'PUT', body })
export const apiPatch = (path, body, options = {}) => apiRequest(path, { ...options, method: 'PATCH', body })
export const apiDelete = (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' })
