import { del, get, postForm } from './client'
import type { DocumentType } from '../types/api'

export interface BalanceEntry {
  document_id: string
  account_name: string | null
  statement_date: string | null
  closing_balance: string | null
  document_type: string
}

export interface DocumentResponse {
  id: string
  user_id: string
  filename: string
  document_type: string
  status: string
  uploaded_at: string
  processed_at: string | null
  error_message: string | null
}

export interface UploadResponse {
  document: DocumentResponse
  transactions_extracted: number
}

export const documentsApi = {
  upload: (file: File, userId: string, documentType: DocumentType): Promise<UploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    form.append('user_id', userId)
    form.append('document_type', documentType)
    return postForm('/documents/upload', form)
  },

  list: (userId: string): Promise<DocumentResponse[]> =>
    get(`/documents?user_id=${userId}`),

  get: (id: string): Promise<DocumentResponse> =>
    get(`/documents/${id}`),

  delete: (id: string): Promise<void> =>
    del(`/documents/${id}`),

  listBalances: (userId: string): Promise<BalanceEntry[]> =>
    get(`/documents/balances?user_id=${userId}`),
}