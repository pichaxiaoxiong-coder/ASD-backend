<template>
  <div class="notification-page flex min-h-screen flex-col bg-gradient-to-b from-[#fff2e8] to-white">
    <div ref="headerRef" class="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center gap-3 px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="router.back()" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <h1 class="text-lg font-bold">通知设置</h1>
      </div>
    </div>
    <main
      class="notification-content flex-1 pb-24 relative z-10"
      :class="isScrollable ? 'scroll-container' : ''"
      :style="contentStyle"
    >
      <div ref="contentRef" class="mx-auto page-col px-6 py-8">
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">所有通知</h3>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">开启/关闭所有通知</span>
            <input type="checkbox" v-model="allEnabled" />
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">学习通知</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between"><span>学习提醒 · 每日学习内容提醒</span><input type="checkbox" v-model="learningEnabled" /></div>
            <div class="flex items-center justify-between"><span>课程内容 · 新章节发布提醒</span><input type="checkbox" v-model="courseEnabled" /></div>
            <div class="flex items-center justify-between"><span>作业通知 · 评分结果提醒</span><input type="checkbox" v-model="homeworkEnabled" /></div>
            <div class="flex items-center justify-between"><span>学习群消息 · 导师/群消息</span><input type="checkbox" v-model="groupEnabled" /></div>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">成就与成长</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between"><span>成就提醒 · 徽章升级</span><input type="checkbox" v-model="trophyEnabled" /></div>
            <div class="flex items-center justify-between"><span>社区互动 · 点赞/评论</span><input type="checkbox" v-model="socialEnabled" /></div>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">系统通知</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between"><span>系统消息 · 维护通知</span><input type="checkbox" v-model="sysMsgEnabled" /></div>
            <div class="flex items-center justify-between"><span>账户安全 · 异常登录提醒</span><input type="checkbox" v-model="securityEnabled" /></div>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">提醒时间设置</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <label class="flex items-center gap-2"><span>每日通知时间</span><div class="field-wrapper flex-1"><input type="time" v-model="notifyTime" class="input w-full" /><svg class="field-icon" viewBox="0 0 24 24"><path d="M12 8v5h5v-2h-3V8h-2zm0-6a10 10 0 100 20 10 10 0 000-20z"/></svg></div></label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="dndEnabled" /> 免打扰</label>
            <label class="flex items-center gap-2"><span>开始</span><div class="field-wrapper flex-1"><input type="time" v-model="dndStart" class="input w-full" /><svg class="field-icon" viewBox="0 0 24 24"><path d="M12 8v5h5v-2h-3V8h-2zm0-6a10 10 0 100 20 10 10 0 000-20z"/></svg></div></label>
            <label class="flex items-center gap-2"><span>结束</span><div class="field-wrapper flex-1"><input type="time" v-model="dndEnd" class="input w-full" /><svg class="field-icon" viewBox="0 0 24 24"><path d="M12 8v5h5v-2h-3V8h-2zm0-6a10 10 0 100 20 10 10 0 000-20z"/></svg></div></label>
          </div>
          <div class="mt-4">
            <button class="btn h-10 px-5 text-[#1677FF] ripple" style="background-image: linear-gradient(180deg, #E8F4FF, #C6E0FF)" @click="sendTest">发送测试通知</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onActivated, nextTick, computed } from 'vue'
import type { CSSProperties } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const allEnabled = ref(true)
const learningEnabled = ref(true)
const courseEnabled = ref(true)
const homeworkEnabled = ref(true)
const groupEnabled = ref(true)
const trophyEnabled = ref(true)
const socialEnabled = ref(true)
const sysMsgEnabled = ref(false)
const securityEnabled = ref(false)
const notifyTime = ref('09:00')
const dndEnabled = ref(false)
const dndStart = ref('22:00')
const dndEnd = ref('08:00')
const sendTest = () => { try { navigator.vibrate?.(30) } catch {}; alert('测试通知已发送') }

const headerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const headerOffset = ref(60)
const isScrollable = ref(true)
let mo: MutationObserver | null = null
const ensurePath = () => {
  const p = router.currentRoute?.value?.path || ''
  if (p !== '/profile/notifications') { try { alert('请跳转到通知设置：/profile/notifications') } catch {}; try { router.push('/profile/notifications') } catch {} }
}
const updateLayout = () => {
  const cssVar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--top-bar-height'))
  const headerH = headerRef.value?.getBoundingClientRect().height ?? (isNaN(cssVar) ? 60 : cssVar)
  headerOffset.value = Math.max(headerH, 60)
  const contentH = contentRef.value?.scrollHeight ?? 0
  const viewportH = window.innerHeight
  isScrollable.value = contentH + headerH > viewportH
  try { console.debug('[通知设置] headerH=', headerH, 'contentH=', contentH, 'viewportH=', viewportH, 'scrollable=', isScrollable.value) } catch {}
}

const contentStyle = computed<CSSProperties>(() => ({
  paddingTop: `calc(${headerOffset.value}px + env(safe-area-inset-top, 0px))`,
  minHeight: `calc(100vh - ${headerOffset.value}px)`,
  overflowY: (isScrollable.value ? 'auto' : 'hidden') as 'auto' | 'hidden'
}))
onMounted(() => {
  ensurePath();
  nextTick(() => updateLayout());
  window.addEventListener('resize', updateLayout);
  window.addEventListener('orientationchange', updateLayout);
  window.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(updateLayout, 50) });
  mo = new MutationObserver(() => updateLayout());
  if (contentRef.value) mo.observe(contentRef.value, { childList: true, subtree: true });
})
onActivated(() => { ensurePath(); nextTick(() => updateLayout()) })
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLayout);
  window.removeEventListener('orientationchange', updateLayout);
  window.removeEventListener('visibilitychange', () => {});
  try { mo?.disconnect() } catch {}
})
</script>

<style scoped>
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.module-box { margin-bottom: 24px; }
.scroll-container { -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }
.scroll-container::-webkit-scrollbar { width: 8px; }
.scroll-container::-webkit-scrollbar-thumb { background-color: rgba(100,116,139,0.5); border-radius: 9999px; }
.scroll-container::-webkit-scrollbar-track { background: transparent; }
@supports (scrollbar-color: auto) { .scroll-container { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,0.5) transparent; } }
.notification-page { --top-bar-height: 60px; }
@media (max-width: 768px) { .notification-page { --top-bar-height: 56px; } }
.notification-content { padding-top: calc(var(--top-bar-height) + env(safe-area-inset-top, 0px)); min-height: calc(100vh - var(--top-bar-height)); }
</style>
