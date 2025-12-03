import { ref } from 'vue'

export type User = {
  id: string
  name: string
  phone?: string
  avatar?: string
  mode: 'child' | 'parent'
}

const userRef = ref<User | null>(null)

export function useUser() {
  const load = async () => {
    const raw = sessionStorage.getItem('启明星-user')
    const name = raw || '用户'
    const mode = (sessionStorage.getItem('启明星-mode') === 'parent' ? 'parent' : 'child') as User['mode']
    const avatar = localStorage.getItem('avatar') || ''
    const phone = localStorage.getItem('phone') || ''
    userRef.value = { id: 'u1', name, mode, avatar, phone }
  }
  const update = async (payload: Partial<User>) => {
    if (!userRef.value) await load()
    userRef.value = { ...userRef.value!, ...payload }
    if (payload.name) sessionStorage.setItem('启明星-user', payload.name)
    if (payload.mode) sessionStorage.setItem('启明星-mode', payload.mode)
    if (payload.avatar !== undefined) localStorage.setItem('avatar', payload.avatar || '')
    if (payload.phone !== undefined) localStorage.setItem('phone', payload.phone || '')
  }
  const logout = async () => {
    localStorage.removeItem('token')
    userRef.value = null
  }
  return { userRef, load, update, logout }
}
