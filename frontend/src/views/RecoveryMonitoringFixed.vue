<template>
  <div class="flex min-h-screen flex-col page-bg">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />
    <div class="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="router.back()" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="flex-1 text-center"><h1 class="title-text" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">康复监测</h1></div>
        <div class="flex items-center gap-3">
          <div class="rounded-full p-1 flex gap-1 bg-gray-100 shadow-sm">
            <button @click="navigateMode('child')" :class="['px-3 py-1.5 rounded-full text-xs', isChildMode ? 'bg-blue-500 text-white' : 'text-gray-600']">儿童模式</button>
            <button @click="navigateMode('parent')" :class="['px-3 py-1.5 rounded-full text-xs', !isChildMode ? 'bg-blue-500 text-white' : 'text-gray-600']">家长模式</button>
          </div>
          <button @click="toggleNight" class="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110" :class="timeOfDay === 'night' ? 'bg-yellow-400' : 'bg-indigo-600'" aria-label="夜间模式"><span class="text-white text-sm">{{ timeOfDay === 'night' ? '☀' : '☾' }}</span></button>
        </div>
      </div>
    </div>

    <main class="flex-1 overflow-y-auto pt-16 pb-24">
      <div class="mx-auto page-col px-6 py-8">
        <div class="section text-center"><h2 class="title-text" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">今日康复任务</h2><p class="body-text" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-600'">完成练习并记录数据，星星为你加油！</p></div>
        <div class="section rounded-2xl p-6" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <div class="flex items-center justify-between mb-4"><h3 class="title-text font-semibold">专注练习计时</h3><div class="text-sm" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-500'">目标：15 分钟</div></div>
          <div class="flex items-center gap-4">
            <div class="rounded-full w-24 h-24 flex items-center justify-center shadow-inner" :class="timeOfDay === 'night' ? 'bg-white/10' : 'bg-white'"><span class="text-xl font-bold">{{ formatTime(elapsedSeconds) }}</span></div>
            <div class="flex-1"><div class="h-3 rounded bg-gray-200 overflow-hidden"><div class="h-3 bg-blue-500" :style="{ width: progressPct + '%' }"></div></div><div class="mt-2 text-xs" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">进度 {{ progressPct.toFixed(0) }}%</div></div>
          </div>
          <div class="mt-4 flex gap-3"><button v-if="!isRunning" @click="startTimer" class="flex-1 rounded bg-blue-600 text-white h-10 active:scale-95">开始</button><button v-else @click="pauseTimer" class="flex-1 rounded bg-yellow-500 text-white h-10 active:scale-95">暂停</button><button @click="resetTimer" class="flex-1 rounded bg-gray-300 text-gray-800 h-10 active:scale-95">重置</button></div>
        </div>
        <div class="section rounded-2xl p-6" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <h3 class="title-text font-semibold mb-3">练习记录</h3>
          <form @submit.prevent="handleSubmitRecord" class="space-y-3">
            <div class="grid grid-cols-2 gap-3"><label class="text-sm"><span class="block mb-1">完成次数</span><input v-model.number="recordForm.reps" type="number" min="0" class="w-full rounded border px-3 py-2" required /></label><label class="text-sm"><span class="block mb-1">主观难度(1-5)</span><input v-model.number="recordForm.difficulty" type="number" min="1" max="5" class="w-full rounded border px-3 py-2" required /></label></div>
            <label class="text-sm block"><span class="block mb-1">备注</span><textarea v-model="recordForm.note" rows="2" class="w-full rounded border px-3 py-2" placeholder="可填写练习情况" /></label>
            <div class="flex gap-3"><button type="submit" class="flex-1 rounded bg-blue-600 text-white h-10 active:scale-95" :disabled="isSubmitting">提交记录</button><button type="button" @click="clearRecord" class="flex-1 rounded bg-gray-300 text-gray-800 h-10 active:scale-95">清空</button></div>
            <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
          </form>
        </div>
        <div class="section rounded-2xl p-6" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <div class="flex items-center justify-between mb-2"><h3 class="title-text font-semibold">最近进度</h3><span class="text-xs" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">近 7 次</span></div>
          <div class="grid grid-cols-7 gap-2"><div v-for="(p, i) in recentProgress" :key="i" class="h-12 rounded flex items-end" :style="{ background: 'linear-gradient(180deg, #93c5fd '+ p + '%, #e5e7eb '+ p + '%)' }"></div></div>
        </div>
      </div>
    </main>

    <nav class="app-bottom-nav"><div class="nav-wrap"><div ref="navIndicator" class="nav-indicator"></div><button class="nav-item ripple" @click="navigate('/dashboard/child', $event)"><div class="nav-icon">💬</div><div class="text-xs">成长陪伴</div></button><button class="nav-item ripple" @click="navigate('/social-decoder/child', $event)"><div class="nav-icon">👥</div><div class="text-xs">社交解码</div></button><button class="nav-item ripple" :aria-current="'page'" @click="navigate('/recovery-monitoring', $event)"><div class="nav-icon">📊</div><div class="text-xs">康复监测</div></button><button class="nav-item ripple" @click="navigate('/profile', $event)"><div class="nav-icon">👤</div><div class="text-xs">我的</div></button></div></nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const timeOfDay = ref<'day' | 'night'>('day')
const theme = useThemeStore()
const isChildMode = ref(true)
const toggleNight = () => { theme.toggle(); timeOfDay.value = theme.darkMode ? 'night' : 'day' }
const navigateMode = (mode: 'child' | 'parent') => { isChildMode.value = mode === 'child'; router.push(`/recovery-monitoring`) }

const elapsedSeconds = ref(0)
const isRunning = ref(false)
let timerId: any = null
const targetSeconds = 15 * 60
const progressPct = computed(() => Math.min(100, (elapsedSeconds.value / targetSeconds) * 100))
const startTimer = () => { if (isRunning.value) return; isRunning.value = true; timerId = setInterval(() => { elapsedSeconds.value += 1 }, 1000) }
const pauseTimer = () => { isRunning.value = false; if (timerId) clearInterval(timerId) }
const resetTimer = () => { pauseTimer(); elapsedSeconds.value = 0 }
const formatTime = (s: number) => { const m = Math.floor(s / 60).toString().padStart(2, '0'); const ss = (s % 60).toString().padStart(2, '0'); return `${m}:${ss}` }

const recordForm = ref({ reps: 0, difficulty: 3, note: '' })
const isSubmitting = ref(false)
const submitError = ref('')
const recentProgress = ref<number[]>([20, 40, 60, 30, 50, 70, 90])

const navIndicator = ref<HTMLElement | null>(null)
const createRipple = (evt: MouseEvent) => { const el = evt.currentTarget as HTMLElement; const rect = el.getBoundingClientRect(); const span = document.createElement('span'); span.className='ripple-circle'; span.style.left=(evt.clientX-rect.left)+'px'; span.style.top=(evt.clientY-rect.top)+'px'; el.appendChild(span); setTimeout(()=>span.remove(),600) }
const moveIndicator = (target: HTMLElement) => { if(!navIndicator.value) return; const rect = target.getBoundingClientRect(); const wrapRect = target.parentElement!.getBoundingClientRect(); navIndicator.value!.style.left=(rect.left-wrapRect.left)+'px'; navIndicator.value!.style.width=rect.width+'px' }
const navigate = (path: string, evt: MouseEvent) => { createRipple(evt); try { window.navigator?.vibrate?.(30) } catch {}; moveIndicator(evt.currentTarget as HTMLElement); router.push(path) }

const handleSubmitRecord = async () => { submitError.value = ''; if (recordForm.value.reps <= 0) { submitError.value = '请填写完成次数'; return } if (recordForm.value.difficulty < 1 || recordForm.value.difficulty > 5) { submitError.value = '难度需在1-5之间'; return } isSubmitting.value = true; await new Promise(r => setTimeout(r, 600)); recentProgress.value = [...recentProgress.value.slice(1), Math.min(100, recordForm.value.reps * 10)]; isSubmitting.value = false }
const clearRecord = () => { recordForm.value = { reps: 0, difficulty: 3, note: '' }; submitError.value = '' }

onMounted(() => { theme.load(); timeOfDay.value = theme.darkMode ? 'night' : 'day'; const btns = document.querySelectorAll('.app-bottom-nav .nav-item'); if (btns.length) moveIndicator(btns[2] as HTMLElement) })
</script>

<style scoped>
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.section { margin-bottom: 24px; }
.title-text { font-size: 18px; }
.body-text { font-size: 14px; }
@media (min-width: 1200px) { .title-text { font-size: 20px; } .body-text { font-size: 16px; } }
</style>
