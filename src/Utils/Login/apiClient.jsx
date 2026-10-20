import { USE_MOCK } from '@/lib/apiConfig'
import mockApiClient from './apiClient.mock'
import httpApiClient from './apiClient.http'

// Cliente de autenticación activo según NEXT_PUBLIC_API_MODE (mock | real)
const apiClient = USE_MOCK ? mockApiClient : httpApiClient

export default apiClient
