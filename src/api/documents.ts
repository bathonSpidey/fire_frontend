import { del, get, postForm } from './client'
import type { Document, DocumentType, UploadResponse } from '../types/api'

export const documentsApi = {
  list: (userId: string): Promise<Document[]> =>
    get(`/documents?user_id=${userId}`),

  get: (id: string): Promise<Document> =>
    get(`/documents/${id}`),

  upload: (
    file: File,
    userId: string,
    documentType: DocumentType = 'unknown',
  ): Promise<UploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    form.append('user_id', userId)
    form.append('document_type', documentType)
    return postForm('/documents/upload', form)
  },

  delete: (id: string): Promise<void> =>
    del(`/documents/${id}`),
}