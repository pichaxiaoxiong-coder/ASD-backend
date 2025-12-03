import { reactive } from 'vue'

export type NotificationPrefs = {
  enabled: boolean
  frequency: 'off' | 'daily' | 'weekly'
  channels: { app: boolean; email: boolean; sms: boolean }
}

export type PrivacyPrefs = {
  dataSharing: boolean
  visibility: 'public' | 'friends' | 'private'
}

export type ReportRecord = {
  id: string
  createdAt: number
  format: 'pdf' | 'csv' | 'json'
  title: string
}

const state = reactive({
  notifications: { enabled: true, frequency: 'daily', channels: { app: true, email: false, sms: false } } as NotificationPrefs,
  privacy: { dataSharing: true, visibility: 'friends' } as PrivacyPrefs,
  reports: [] as ReportRecord[]
})

const LS_KEY = '启明星-settings'

export function useSettings() {
  const load = () => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const obj = JSON.parse(raw)
        Object.assign(state.notifications, obj.notifications || {})
        Object.assign(state.privacy, obj.privacy || {})
        state.reports = Array.isArray(obj.reports) ? obj.reports : []
      } catch {}
    }
  }

  const save = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }

  const upsertReport = (record: ReportRecord) => {
    const idx = state.reports.findIndex(r => r.id === record.id)
    if (idx >= 0) state.reports[idx] = record
    else state.reports.unshift(record)
    save()
  }

  const removeReport = (id: string) => {
    state.reports = state.reports.filter(r => r.id !== id)
    save()
  }

  return { state, load, save, upsertReport, removeReport }
}
