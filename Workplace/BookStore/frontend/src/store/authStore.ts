import type { User } from '../types'

export const authStore = {
  getToken: (): string | null => localStorage.getItem('token'),

  getUser: (): User | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setAuth: (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  isLoggedIn: (): boolean => !!localStorage.getItem('token'),

  isAdmin: (): boolean => {
    const user = authStore.getUser()
    return user?.role === 'ADMIN' || user?.role === 'EMPLOYEE'
  }
}