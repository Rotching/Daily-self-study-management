import { apiGet, unwrapData } from '@/api/client'

export const searchAdminUsers = async (params = {}, options = {}) => unwrapData(await apiGet('/admin/users/search', {
  ...options,
  params
}))

export const getAdminUserData = async (userId, params = {}, options = {}) => {
  if (userId === undefined || userId === null || userId === '') {
    throw new TypeError('getAdminUserData 需要有效的 userId')
  }

  return unwrapData(await apiGet(`/admin/users/${encodeURIComponent(String(userId))}/data`, {
    ...options,
    params
  }))
}

export const getAdminUserStatistics = async (params = {}, options = {}) => unwrapData(await apiGet('/admin/users/statistics', {
  ...options,
  params
}))
