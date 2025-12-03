export type AppMode = 'child' | 'parent'

const KEY_MODE = '启明星-mode'
const KEY_PIN = '启明星-pin-hash'
const KEY_LOGIN_PWD = '启明星-login-pwd-hash'
const KEY_USAGE_LIMIT = '启明星-usage-limit'
const KEY_USAGE_TODAY = '启明星-usage-today'
const KEY_AUTO_LOCK = '启明星-auto-lock'
const KEY_AUTO_LOCK_MIN = '启明星-auto-lock-min'
const KEY_DIFF = '启明星-content-difficulty'
const KEY_BLOCK_CONFLICT = '启明星-content-block-conflict'
const KEY_BLOCK_INTENSE = '启明星-content-block-intense'
const KEY_BLACKLIST = '启明星-content-blacklist'
const KEY_TREND = '启明星-metrics-emotion-trend'
const KEY_REHAB_PROGRESS = '启明星-rehab-progress'
const KEY_REHAB_REMINDER = '启明星-rehab-reminder'

async function hash(str: string): Promise<string> {
  try {
    const enc = new TextEncoder()
    const data = enc.encode(str)
    const buf = await crypto.subtle.digest('SHA-256', data)
    const bytes = Array.from(new Uint8Array(buf))
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
    return h.toString(16)
  }
}

export function getMode(): AppMode {
  const v = sessionStorage.getItem(KEY_MODE)
  return v === 'parent' ? 'parent' : 'child'
}

export function setMode(mode: AppMode): void {
  sessionStorage.setItem(KEY_MODE, mode)
}

export async function ensurePin(): Promise<void> {
  const cur = localStorage.getItem(KEY_PIN)
  if (!cur) {
    const h = await hash('123456')
    localStorage.setItem(KEY_PIN, h)
  }
}

export async function setPin(pin: string): Promise<void> {
  const h = await hash(pin)
  localStorage.setItem(KEY_PIN, h)
}

export async function verifyPin(pin: string): Promise<boolean> {
  await ensurePin()
  const h = await hash(pin)
  const saved = localStorage.getItem(KEY_PIN)
  return !!saved && saved === h
}

export async function ensureLoginPassword(): Promise<void> {
  const cur = localStorage.getItem(KEY_LOGIN_PWD)
  if (!cur) {
    const h = await hash('parent123')
    localStorage.setItem(KEY_LOGIN_PWD, h)
  }
}

export async function setLoginPassword(pwd: string): Promise<void> {
  const h = await hash(pwd)
  localStorage.setItem(KEY_LOGIN_PWD, h)
}

export async function verifyLoginPassword(pwd: string): Promise<boolean> {
  await ensureLoginPassword()
  const h = await hash(pwd)
  const saved = localStorage.getItem(KEY_LOGIN_PWD)
  return !!saved && saved === h
}

export function getUsageLimit(): number {
  const raw = localStorage.getItem(KEY_USAGE_LIMIT)
  const v = raw ? parseInt(raw, 10) : 60
  return isNaN(v) ? 60 : v
}

export function setUsageLimit(mins: number): void {
  localStorage.setItem(KEY_USAGE_LIMIT, String(mins))
}

export function getUsageToday(): number {
  const raw = localStorage.getItem(KEY_USAGE_TODAY)
  const v = raw ? parseInt(raw, 10) : 0
  return isNaN(v) ? 0 : v
}

export function setUsageToday(mins: number): void {
  localStorage.setItem(KEY_USAGE_TODAY, String(mins))
}

export function getAutoLock(): boolean {
  return localStorage.getItem(KEY_AUTO_LOCK) === '1'
}

export function setAutoLock(on: boolean): void {
  localStorage.setItem(KEY_AUTO_LOCK, on ? '1' : '0')
}

export function getAutoLockMinutes(): number {
  const raw = localStorage.getItem(KEY_AUTO_LOCK_MIN)
  const v = raw ? parseInt(raw, 10) : 10
  return isNaN(v) ? 10 : Math.max(1, Math.min(120, v))
}

export function setAutoLockMinutes(mins: number): void {
  const v = Math.max(1, Math.min(120, Math.round(mins)))
  localStorage.setItem(KEY_AUTO_LOCK_MIN, String(v))
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export function getDifficulty(): Difficulty {
  const v = localStorage.getItem(KEY_DIFF) as Difficulty | null
  return v === 'easy' || v === 'hard' ? v : 'medium'
}

export function setDifficulty(v: Difficulty): void {
  localStorage.setItem(KEY_DIFF, v)
}

export function getBlockConflict(): boolean {
  return localStorage.getItem(KEY_BLOCK_CONFLICT) === '1'
}

export function setBlockConflict(on: boolean): void {
  localStorage.setItem(KEY_BLOCK_CONFLICT, on ? '1' : '0')
}

export function getBlockIntense(): boolean {
  return localStorage.getItem(KEY_BLOCK_INTENSE) === '1'
}

export function setBlockIntense(on: boolean): void {
  localStorage.setItem(KEY_BLOCK_INTENSE, on ? '1' : '0')
}

export function getBlacklist(): string[] {
  const raw = localStorage.getItem(KEY_BLACKLIST)
  try {
    const arr = raw ? JSON.parse(raw) : []
    if (Array.isArray(arr)) return arr.map(x => String(x)).filter(x => x.length > 0)
  } catch {}
  return []
}

export function setBlacklist(arr: string[]): void {
  localStorage.setItem(KEY_BLACKLIST, JSON.stringify(arr))
}

export function getEmotionTrend(): number[] {
  const raw = localStorage.getItem(KEY_TREND)
  try {
    const arr = raw ? JSON.parse(raw) : null
    if (Array.isArray(arr) && arr.length >= 7) return arr.slice(0, 7).map(n => Math.max(0, Math.min(100, Number(n))))
  } catch {}
  const base = 50
  const arr = Array.from({ length: 7 }, (_, i) => base + Math.round(Math.sin(i) * 10) + i)
  localStorage.setItem(KEY_TREND, JSON.stringify(arr))
  return arr
}

export function setEmotionTrend(arr: number[]): void {
  localStorage.setItem(KEY_TREND, JSON.stringify(arr.map(n => Math.max(0, Math.min(100, Number(n))))))
}

export function getRehabProgress(): number {
  const raw = localStorage.getItem(KEY_REHAB_PROGRESS)
  const v = raw ? parseInt(raw, 10) : 75
  return isNaN(v) ? 75 : Math.max(0, Math.min(100, v))
}

export function setRehabProgress(v: number): void {
  localStorage.setItem(KEY_REHAB_PROGRESS, String(Math.max(0, Math.min(100, v))))
}

export function getRehabReminder(): boolean {
  return localStorage.getItem(KEY_REHAB_REMINDER) === '1'
}

export function setRehabReminder(on: boolean): void {
  localStorage.setItem(KEY_REHAB_REMINDER, on ? '1' : '0')
}

