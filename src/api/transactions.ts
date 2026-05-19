import { del, get, patch } from './client'
import type { PatchTransactionRequest, Transaction } from '../types/api'

export const transactionsApi = {
  list: (userId: string, year?: number, month?: number): Promise<Transaction[]> => {
    const params = new URLSearchParams({ user_id: userId })
    if (year !== undefined) params.set('year', String(year))
    if (month !== undefined) params.set('month', String(month))
    return get(`/transactions?${params}`)
  },

  get: (id: string): Promise<Transaction> =>
    get(`/transactions/${id}`),

  patch: (id: string, req: PatchTransactionRequest): Promise<Transaction> =>
    patch(`/transactions/${id}`, req),

  delete: (id: string): Promise<void> =>
    del(`/transactions/${id}`),
}