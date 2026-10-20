import { USE_MOCK } from '@/lib/apiConfig'
import mockDataSource from './mockDataSource'
import httpDataSource from './httpDataSource'

// Única fuente de datos activa según NEXT_PUBLIC_API_MODE
const dataSource = USE_MOCK ? mockDataSource : httpDataSource

export default dataSource
