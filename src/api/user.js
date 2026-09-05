import { apiGet, apiPut } from '@/api/client'

export const getUserProfile = (options = {}) => apiGet('/api/user/profile', options)
export const updateUserProfile = (body, options = {}) => apiPut('/api/user/profile', body, options)
export const getUserStatistics = (options = {}) => apiGet('/api/user/statistics', options)
