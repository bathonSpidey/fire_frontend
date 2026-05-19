import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/api'

interface UserStore {
  activeUser: User | null
  setActiveUser: (user: User) => void
  clearActiveUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      activeUser: null,
      setActiveUser: (user) => set({ activeUser: user }),
      clearActiveUser: () => set({ activeUser: null }),
    }),
    {
      name: 'fire-active-user',  // localStorage key
    },
  ),
)

// Convenience selector
export const useActiveUser = () => useUserStore((s) => s.activeUser)