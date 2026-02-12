import api from './api'
import { OHLCVData } from '../types'

export interface OHLCVResponse {
  symbol: string
  data: OHLCVData[]
  cached: boolean
}

export const dataService = {
  /**
   * Fetch OHLCV data for a symbol
   */
  async getOHLCVData(
    symbol: string,
    startDate?: string,
    endDate?: string,
    interval: string = 'daily'
  ): Promise<OHLCVResponse> {
    const params = new URLSearchParams()
    params.append('symbol', symbol)
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    params.append('interval', interval)

    const response = await api.get(`/api/data/ohlcv?${params.toString()}`)
    return response.data
  },

  /**
   * Get list of available symbols
   */
  async getAvailableSymbols(): Promise<Array<{ symbol: string; name: string }>> {
    const response = await api.get('/api/data/symbols')
    return response.data.symbols
  },

  /**
   * Force refresh data from API
   */
  async refreshData(symbol: string): Promise<{ message: string; records: number }> {
    const response = await api.post('/api/data/refresh', {
      symbol,
      interval: 'daily'
    })
    return response.data
  }
}
