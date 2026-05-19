// ─────────────────────────────────────────────────────────────────────────────
// API Client — base fetch wrapper
// All API modules import from here, never call fetch directly.
// ─────────────────────────────────────────────────────────────────────────────

import type { ApiError } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8101'

// Plain class — no TypeScript parameter property shorthand
export class ApiRequestError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiRequestError'
    this.status = status
    this.detail = detail
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }
  let detail = `HTTP ${res.status}`
  try {
    const err: ApiError = await res.json()
    detail = err.detail ?? detail
  } catch {
    detail = res.statusText || detail
  }
  throw new ApiRequestError(res.status, detail)
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  return handleResponse<T>(res)
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res)
}

export async function postForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form,
  })
  return handleResponse<T>(res)
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  })
  return handleResponse<void>(res)
}