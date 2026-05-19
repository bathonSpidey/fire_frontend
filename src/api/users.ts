import { get, post } from './client'
import type { User, CreateUserRequest } from '../types/api'

export const usersApi = {
  list: (): Promise<User[]> =>
    get('/users'),

  get: (id: string): Promise<User> =>
    get(`/users/${id}`),

  create: (req: CreateUserRequest): Promise<User> =>
    post('/users', req),
}