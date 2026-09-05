import { apiDelete, apiGet, apiPatch, apiPost, apiPut, unwrapData } from '@/api/client'

export const getDailyTasks = async (date, options = {}) => unwrapData(await apiGet('/api/tasks/daily', { ...options, params: { date } }))
export const createTask = async (body, options = {}) => unwrapData(await apiPost('/api/tasks', body, options))
export const updateTask = async (taskId, body, options = {}) => unwrapData(await apiPut(`/api/tasks/${encodeURIComponent(taskId)}`, body, options))
export const deleteTask = async (taskId, options = {}) => unwrapData(await apiDelete(`/api/tasks/${encodeURIComponent(taskId)}`, options))
export const batchUpdateTasks = async (updates, options = {}) => unwrapData(await apiPatch('/api/tasks/batch', { updates }, options))
export const getTaskTemplates = async (category, options = {}) => unwrapData(await apiGet('/api/tasks/templates', { ...options, params: { category } }))
