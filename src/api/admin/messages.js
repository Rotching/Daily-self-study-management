import { apiGet, unwrapData } from '@/api/client'

export const getAdminMessages = async (params = {}, options = {}) => unwrapData(await apiGet('/admin/messages', {
  ...options,
  params
}))

export const getAdminMessageStatistics = async (options = {}) => unwrapData(await apiGet('/admin/messages/statistics', options))
