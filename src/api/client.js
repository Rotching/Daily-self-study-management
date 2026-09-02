const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? null
    this.payload = options.payload ?? null
  }
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
  if (!API_BASE_URL) {
    throw new ApiError('缺少 VITE_API_BASE_URL 环境配置')
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}${buildQuery(params)}`
}

export const apiGet = async (path, options = {}) => {
  const { params, signal, token } = options
  const headers = { Accept: 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(buildApiUrl(path, params), {
      method: 'GET',
      headers,
      signal
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError('网络请求失败', { payload: error })
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new ApiError(payload?.message || `请求失败（HTTP ${response.status}）`, {
      status: response.status,
      payload
    })
  }

  // 业务成功码尚未确认，因此这里只返回后端原始 JSON，不做 data 解包。
  return payload
}
