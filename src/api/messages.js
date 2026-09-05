import { apiGet, apiPost, unwrapData } from '@/api/client'

export const unlockMessage = async (body, options = {}) => unwrapData(await apiPost('/messages/unlock', body, options))
export const getMessages = async (params = {}, options = {}) => unwrapData(await apiGet('/messages', { ...options, params }))
export const collectMessage = async (messageId, body = {}, options = {}) => unwrapData(await apiPost(`/messages/${encodeURIComponent(messageId)}/collect`, body, options))
export const likeMessage = async (messageId, liked, options = {}) => unwrapData(await apiPost(`/messages/${encodeURIComponent(messageId)}/like`, { liked }, options))
export const getMessageStatistics = async (options = {}) => unwrapData(await apiGet('/messages/statistics', options))
export const submitMessage = async (content, options = {}) => unwrapData(await apiPost('/messages/submit', { content }, options))
