import { apiGet } from '@/api/client'

export const getAdminMessages = (params = {}, options = {}) => apiGet('/admin/messages', {
  ...options,
  params
})

export const getAdminMessageStatistics = (options = {}) => apiGet('/admin/messages/statistics', options)
