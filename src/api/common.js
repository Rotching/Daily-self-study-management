import { apiGet, unwrapData } from '@/api/client'

export const getGreeting = async (options = {}) => unwrapData(await apiGet('/common/greeting', options))
export const getSystemConfig = async (options = {}) => unwrapData(await apiGet('/common/config', options))
