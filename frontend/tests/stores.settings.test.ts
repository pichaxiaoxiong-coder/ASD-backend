import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

describe('Settings Store', () => {
  beforeEach(() => { setActivePinia(createPinia()); localStorage.clear() })

  it('loads and saves preferences', () => {
    const store = useSettingsStore()
    store.notifications.enabled = false
    store.save()
    const saved = JSON.parse(localStorage.getItem('启明星-settings') || '{}')
    expect(saved.notifications.enabled).toBe(false)
  })

  it('upserts report', () => {
    const store = useSettingsStore()
    store.upsertReport({ id: 'r1', createdAt: Date.now(), format: 'pdf', title: '学习报告' })
    expect(store.reports.length).toBe(1)
    store.upsertReport({ id: 'r1', createdAt: Date.now(), format: 'csv', title: '学习报告' })
    expect(store.reports[0].format).toBe('csv')
  })
})
