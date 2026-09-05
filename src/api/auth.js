import { apiPost, clearAuthSession, getAuthSession, setAuthSession } from '@/api/client'

export const login = async (credentials) => {
  const session = await apiPost('/api/auth/login', credentials, { auth: false })
  setAuthSession(session)
  return session
}

export const register = async (credentials) => {
  const session = await apiPost('/api/auth/register', credentials, { auth: false })
  setAuthSession(session)
  return session
}

export const logout = async () => {
  const session = getAuthSession()
  try {
    if (session?.refreshToken) await apiPost('/api/auth/logout', { refreshToken: session.refreshToken })
  } finally {
    clearAuthSession()
  }
}
