import api from './api'
import { Strategy, BacktestResult } from '../types'

export interface BacktestRequest {
  symbol: string
  start_date: string
  end_date: string
  strategy: Strategy
  initial_capital: number
}

export const backtestService = {
  /**
   * Run a backtest
   */
  async runBacktest(request: BacktestRequest): Promise<BacktestResult> {
    const response = await api.post('/api/backtest/run', request)
    return response.data
  },

  /**
   * Get backtest status (for async execution)
   */
  async getBacktestStatus(backtestId: string): Promise<any> {
    const response = await api.get(`/api/backtest/status/${backtestId}`)
    return response.data
  }
}
