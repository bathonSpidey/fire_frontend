// ─────────────────────────────────────────────────────────────────────────────
// API Types — mirrors fire_backend Pydantic schemas
// Keep in sync with src/fire/api/schemas/
// ─────────────────────────────────────────────────────────────────────────────

// ── Users ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  created_at: string
}

export interface CreateUserRequest {
  name: string
}

// ── Documents ─────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'bank_statement'
  | 'investment_statement'
  | 'receipt'
  | 'unknown'

export type DocumentStatus =
  | 'pending'
  | 'processing'
  | 'processed'
  | 'failed'

export interface Document {
  id: string
  user_id: string
  filename: string
  document_type: DocumentType
  status: DocumentStatus
  uploaded_at: string
  processed_at: string | null
  error_message: string | null
}

export interface UploadResponse {
  document: Document
  transactions_extracted: number
}

// ── Transactions ──────────────────────────────────────────────────────────────

export type TransactionType = 'debit' | 'credit'

export type TransactionCategory =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'income'
  | 'investment'
  | 'savings'
  | 'transfer'
  | 'other'

export interface Transaction {
  id: string
  user_id: string
  document_id: string
  date: string
  description: string
  amount: string   // backend sends Decimal as string
  transaction_type: TransactionType
  category: TransactionCategory
  merchant: string | null
  notes: string | null
  is_recurring: boolean
  parent_transaction_id: string | null
  receipt_document_id: string | null
  is_receipt_item: boolean
}

export interface PatchTransactionRequest {
  amount?: string
  transaction_type?: TransactionType
  category?: TransactionCategory
  description?: string
  merchant?: string | null
  notes?: string | null
  is_recurring?: boolean
}

// ── Insights ──────────────────────────────────────────────────────────────────

export interface SpendingBreakdown {
  category: TransactionCategory
  total: string
  transaction_count: number
  percentage_of_spend: string
}

export interface Insight {
  id: string
  user_id: string
  year: number
  month: number
  total_income: string
  total_expenses: string
  net_savings: string
  savings_rate: string
  spending_breakdown: SpendingBreakdown[]
  llm_summary: string
  llm_tips: string[]
  generated_at: string
  fire_progress_note: string | null
}

export interface GenerateInsightRequest {
  fire_progress_note?: string | null
}

// ── Shared ────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string
}

export type MonthYear = {
  year: number
  month: number
}

// Category display helpers
export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  groceries:     'Groceries',
  dining:        'Dining',
  transport:     'Transport',
  housing:       'Housing',
  utilities:     'Utilities',
  healthcare:    'Healthcare',
  entertainment: 'Entertainment',
  shopping:      'Shopping',
  income:        'Income',
  investment:    'Investment',
  savings:       'Savings',
  transfer:      'Transfer',
  other:         'Other',
}

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  groceries:     '🛒',
  dining:        '🍽️',
  transport:     '🚌',
  housing:       '🏠',
  utilities:     '⚡',
  healthcare:    '💊',
  entertainment: '🎬',
  shopping:      '🛍️',
  income:        '💰',
  investment:    '📈',
  savings:       '🏦',
  transfer:      '↔️',
  other:         '•',
}