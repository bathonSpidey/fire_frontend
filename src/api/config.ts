import { get, patch } from './client'

export interface AppConfig {
  receipt_provider: string
  gemini_model: string
  gemini_available_models: string[]
}

export const configApi = {
  get: (): Promise<AppConfig> => get('/config'),

  setModel: (model: string): Promise<AppConfig> =>
    patch('/config/gemini-model', { model }),
}