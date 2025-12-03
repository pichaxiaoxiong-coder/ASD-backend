import { defineStore } from 'pinia'

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

const LS_KEY = '启明星-settings'

export const useSettingsStore = defineStore('settings', {
  state: (): { notifications: NotificationPrefs; privacy: PrivacyPrefs; reports: ReportRecord[] } => ({
    notifications: { enabled: true, frequency: 'daily', channels: { app: true, email: false, sms: false } },
    privacy: { dataSharing: true, visibility: 'friends' },
    reports: []
  }),
  actions: {
    load() {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        try {
          const obj = JSON.parse(raw)
          Object.assign(this.notifications, obj.notifications || {})
          Object.assign(this.privacy, obj.privacy || {})
          this.reports = Array.isArray(obj.reports) ? obj.reports : []
        } catch {}
      }
    },
    save() { localStorage.setItem(LS_KEY, JSON.stringify(this.$state)) },
    upsertReport(record: ReportRecord) {
      const idx = this.reports.findIndex(r => r.id === record.id)
      if (idx >= 0) this.reports[idx] = record
      else this.reports.unshift(record)
      this.save()
    },
    removeReport(id: string) {
      this.reports = this.reports.filter(r => r.id !== id)
      this.save()
    }
  }
})
