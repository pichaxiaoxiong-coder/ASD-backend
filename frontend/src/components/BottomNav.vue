<template>
  <nav class="app-bottom-nav">
    <div class="nav-wrap">
      <div ref="indicator" class="nav-indicator"></div>
      <button class="nav-item ripple" :aria-current="isActive('dashboard') ? 'page' : undefined" @click="onClick('/dashboard/child', $event)"><div class="nav-icon">💬</div><div class="text-xs">成长陪伴</div></button>
      <button class="nav-item ripple" :aria-current="isActive('social') ? 'page' : undefined" @click="onClick('/social-decoder/child', $event)"><div class="nav-icon">👥</div><div class="text-xs">社交解码</div></button>
      <button class="nav-item ripple" :aria-current="isActive('recovery') ? 'page' : undefined" @click="onClick('/recovery-monitoring', $event)"><div class="nav-icon">📊</div><div class="text-xs">康复监测</div></button>
      <button class="nav-item ripple" :aria-current="isActive('profile') ? 'page' : undefined" @click="onClick('/profile', $event)"><div class="nav-icon">👤</div><div class="text-xs">我的</div><span v-if="showDot" class="breath-dot" style="position:absolute;top:6px;right:10px"></span></button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const indicator = ref<HTMLElement | null>(null)
const showDot = defineModel<boolean>('dot', { default: false })

const createRipple = (evt: MouseEvent) => {
  const el = evt.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const span = document.createElement('span')
  span.className = 'ripple-circle'
  span.style.left = (evt.clientX - rect.left) + 'px'
  span.style.top = (evt.clientY - rect.top) + 'px'
  el.appendChild(span)
  setTimeout(() => span.remove(), 600)
}
const vibrate = () => { try { window.navigator?.vibrate?.(30) } catch {} }
const moveIndicator = (target: HTMLElement) => {
  if (!indicator.value) return
  const rect = target.getBoundingClientRect()
  const wrapRect = target.parentElement!.getBoundingClientRect()
  indicator.value!.style.left = (rect.left - wrapRect.left) + 'px'
  indicator.value!.style.width = rect.width + 'px'
}
const syncIndicator = () => {
  const items = Array.from(document.querySelectorAll('.app-bottom-nav .nav-item')) as HTMLElement[]
  const map = [
    { key: 'dashboard', test: (p: string) => p.startsWith('/dashboard') },
    { key: 'social', test: (p: string) => p.startsWith('/social-decoder') || p.startsWith('/social-game') },
    { key: 'recovery', test: (p: string) => p.startsWith('/recovery-monitoring') },
    { key: 'profile', test: (p: string) => p.startsWith('/profile') || p.startsWith('/settings') }
  ]
  const p = route.fullPath
  const idx = map.findIndex(m => m.test(p))
  if (idx >= 0 && items[idx]) moveIndicator(items[idx])
}
const onClick = (path: string, evt: MouseEvent) => {
  createRipple(evt); vibrate(); moveIndicator(evt.currentTarget as HTMLElement); router.push(path)
}
const isActive = (key: 'dashboard' | 'social' | 'recovery' | 'profile') => {
  const p = route.fullPath
  if (key === 'dashboard') return p.startsWith('/dashboard')
  if (key === 'social') return p.startsWith('/social-decoder') || p.startsWith('/social-game')
  if (key === 'recovery') return p.startsWith('/recovery-monitoring')
  return p.startsWith('/profile') || p.startsWith('/settings')
}

onMounted(syncIndicator)
watch(() => route.fullPath, () => setTimeout(syncIndicator))
</script>

<style scoped>
.app-bottom-nav { min-height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px); background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-top: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04); }
.app-bottom-nav .nav-item { flex: 1; text-align: center; }
.app-bottom-nav .nav-item .nav-icon { font-size: 22px; margin-bottom: 4px; }
.app-bottom-nav .nav-item:nth-child(1) .nav-icon { color: #FF7E5A; }
.app-bottom-nav .nav-item:nth-child(2) .nav-icon { color: #4A90E2; }
.app-bottom-nav .nav-item:nth-child(3) .nav-icon { color: #50C878; }
.app-bottom-nav .nav-item:nth-child(4) .nav-icon { color: #9B59B6; }
.app-bottom-nav .nav-item.active:nth-child(1) { color: #FF7E5A; }
.app-bottom-nav .nav-item.active:nth-child(2) { color: #4A90E2; }
.app-bottom-nav .nav-item.active:nth-child(3) { color: #50C878; }
.app-bottom-nav .nav-item.active:nth-child(4) { color: #9B59B6; }
@media (max-width: 768px) {
  .app-bottom-nav { background: rgba(255, 255, 255, 0.95); }
  .app-bottom-nav .nav-item { padding: 6px 4px; }
  .app-bottom-nav .nav-item .nav-icon { font-size: 20px; margin-bottom: 3px; }
  .app-bottom-nav .nav-item .text-xs { font-size: 11px; }
}
@media (max-width: 360px) {
  .app-bottom-nav .nav-item .nav-icon { font-size: 18px; }
  .app-bottom-nav .nav-item .text-xs { font-size: 10px; }
}
.app-bottom-nav .nav-item { flex: 1; text-align: center; }
.app-bottom-nav .nav-item .nav-icon { font-size: 22px; margin-bottom: 4px; }
.app-bottom-nav .nav-item:nth-child(1) .nav-icon { color: #FF7E5A; }
.app-bottom-nav .nav-item:nth-child(2) .nav-icon { color: #4A90E2; }
.app-bottom-nav .nav-item:nth-child(3) .nav-icon { color: #50C878; }
.app-bottom-nav .nav-item:nth-child(4) .nav-icon { color: #9B59B6; }
.app-bottom-nav .nav-item.active:nth-child(1) { color: #FF7E5A; }
.app-bottom-nav .nav-item.active:nth-child(2) { color: #4A90E2; }
.app-bottom-nav .nav-item.active:nth-child(3) { color: #50C878; }
.app-bottom-nav .nav-item.active:nth-child(4) { color: #9B59B6; }
</style>
