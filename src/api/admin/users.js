import { apiGet } from '@/api/client'

export const searchAdminUsers = (params = {}, options = {}) => apiGet('/admin/users/search', {
  ...options,
  params
})

export const getAdminUserData = (userId, params = {}, options = {}) => {
  if (userId === undefined || userId === null || userId === '') {
    throw new TypeError('getAdminUserData 需要有效的 userId')
  }

  return apiGet(`/admin/users/${encodeURIComponent(String(userId))}/data`, {
    ...options,
    params
  })
}

export const getAdminUserStatistics = (params = {}, options = {}) => apiGet('/admin/users/statistics', {
  ...options,
  params
})
