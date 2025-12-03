import { defineStore } from 'pinia'

export type User = {
  id: string
  name: string
  phone?: string
  avatar?: string
  mode: 'child' | 'parent'
}

export const useUserStore = defineStore('user', {
  state: (): { user: User | null } => ({ user: null }),
  actions: {
    async load() {
      const raw = sessionStorage.getItem('启明星-user')
      const name = raw || '用户'
      const mode = (sessionStorage.getItem('启明星-mode') === 'parent' ? 'parent' : 'child') as User['mode']
      const avatar = localStorage.getItem('avatar') || ''
      const phone = localStorage.getItem('phone') || ''
      this.user = { id: 'u1', name, mode, avatar, phone }
    },
    async update(payload: Partial<User>) {
      if (!this.user) await this.load()
      this.user = { ...this.user!, ...payload }
      if (payload.name) sessionStorage.setItem('启明星-user', payload.name)
      if (payload.mode) sessionStorage.setItem('启明星-mode', payload.mode)
      if (payload.avatar !== undefined) localStorage.setItem('avatar', payload.avatar || '')
      if (payload.phone !== undefined) localStorage.setItem('phone', payload.phone || '')
    },
    async logout() {
      localStorage.removeItem('token')
      this.user = null
    }
  }
})
