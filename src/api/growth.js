import { apiGet, unwrapData } from '@/api/client'

export const getGrowthTrack = async (params = {}, options = {}) => unwrapData(await apiGet('/growth/track', { ...options, params }))
export const getGrowthNode = async (date, options = {}) => unwrapData(await apiGet(`/growth/nodes/${encodeURIComponent(date)}`, options))
export const getGrowthOverview = async (options = {}) => unwrapData(await apiGet('/growth/overview', options))
