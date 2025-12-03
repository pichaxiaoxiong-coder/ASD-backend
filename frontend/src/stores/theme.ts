import { defineStore } from 'pinia'

const KEY = '启明星-theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({ darkMode: false as boolean }),
  actions: {
    load() {
      const raw = localStorage.getItem(KEY)
      if (raw === 'dark') this.darkMode = true
      else if (raw === 'light') this.darkMode = false
      else {
        const m = window.matchMedia?.('(prefers-color-scheme: dark)')
        this.darkMode = !!m?.matches
      }
    },
    save() { localStorage.setItem(KEY, this.darkMode ? 'dark' : 'light') },
    toggle() { this.darkMode = !this.darkMode; this.save() },
    set(val: boolean) { this.darkMode = val; this.save() }
  }
})
