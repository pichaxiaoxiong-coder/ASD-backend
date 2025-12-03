<template>
  <div class="relative min-h-screen overflow-hidden pb-24" :class="timeOfDay === 'night' ? 'bg-night' : 'bg-day'">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />

    <div class="relative z-10 flex min-h-screen flex-col">
      <div class="p-4">
        <button @click="goBack" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white/95 active:scale-95" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
      </div>

      <div class="flex justify-center gap-2 py-4">
        <div v-for="(completed, idx) in progress" :key="idx" :class="['h-3 w-3 rounded-full transition-all duration-300', completed ? 'bg-blue-500 scale-110' : 'bg-white/40']" />
      </div>

      <div class="flex flex-col items-center gap-4 px-4 pt-8">
        <div class="relative">
          <div v-if="!showPrompt" class="absolute -top-20 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="text-6xl">{{ currentEmotion.emoji }}</div>
          </div>
          <div class="w-32 h-32 rounded-full flex items-center justify-center shadow" :class="timeOfDay === 'night' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/70'">
            <img src="/images/star-mascot.png" alt="星星" class="w-20 h-20 animate-float" />
          </div>
          <div v-if="showPrompt" class="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap animate-bounce">
            <div class="rounded-2xl bg-white/95 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg border-2 border-[#f2f2f2]">
              轮到宝贝啦～
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div class="relative w-full max-w-sm">
          <div class="overflow-hidden rounded-2xl border-2 border-blue-400/30 bg-white/80 backdrop-blur-sm shadow-lg">
            <video ref="videoRef" autoplay playsinline muted class="h-60 w-full object-cover" :style="{ transform: 'scaleX(-1)' }" />
            <canvas ref="canvasRef" class="hidden" />
          </div>

          <div v-if="isCapturing && !showResult" class="absolute -top-20 left-1/2 -translate-x-1/2 animate-in fade-in duration-300">
            <div class="rounded-xl bg-gray-900/90 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm">识别中...</div>
          </div>

          <div v-if="showResult === 'success'" class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center -translate-y-6 animate-in fade-in zoom-in duration-500">
            <div class="relative">
              <div class="rounded-2xl bg-white/95 px-8 py-6 text-center shadow-xl border-2 border-blue-400">
                <div class="text-4xl mb-2">🎉</div>
                <div class="text-lg font-semibold text-gray-900">太棒了！</div>
              </div>
              <div class="absolute inset-0 pointer-events-none">
                <div v-for="i in 12" :key="i" class="absolute w-2 h-2 rounded-full" :style="particleStyle(i)" />
              </div>
            </div>
          </div>

          <div v-if="showResult === 'retry'" class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center -translate-y-6 animate-in fade-in zoom-in duration-300">
            <div class="rounded-2xl bg-yellow-100/95 px-6 py-4 text-center shadow-xl border-2 border-yellow-200">
              <div class="text-sm font-medium text-gray-800 mb-3">再试一次，星星陪你！</div>
              <button @click="handleRetry" class="rounded-xl bg-white px-6 py-2 text-sm font-medium text-gray-900 transition-all active:scale-95">重试</button>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 pb-10">
        <button @click="handleCapture" @mousedown="handleButtonPress" :disabled="isCapturing || !showPrompt" class="relative w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFF8F3] to-[#FFF4E8] border-2 border-[#FFD8C1] px-8 py-4 text-lg font-semibold text-[#4A7BA7] shadow-[inset_0_0_8px_rgba(0,0,0,0.04)] transition-all active:scale-95 disabled:opacity-50" :style="{ opacity: 0.96 }">
          <span v-for="(particle, idx) in particles" :key="particle.id" class="absolute w-1.5 h-1.5 rounded-full pointer-events-none" :style="buttonParticleStyle(particle, idx)" />
          拍照
        </button>
      </div>
      <div v-if="isPageLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div class="rounded-xl bg-white/90 px-6 py-3 text-sm font-medium text-gray-800 shadow">加载中...</div>
      </div>
      <div v-if="isNavigating" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div class="rounded-xl bg-white/90 px-6 py-3 text-sm font-medium text-gray-800 shadow">返回中...</div>
      </div>
      <div v-if="navError" class="nav-toast">{{ navError }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import { apiClient } from '@/lib/api'

type Emotion = { emoji: string; name: string }
const EMOTIONS: Emotion[] = [
  { emoji: '😊', name: 'happy' },
  { emoji: '😮', name: 'surprised' },
  { emoji: '😢', name: 'sad' }
]

const timeOfDay = ref<'day' | 'night'>('day')
const currentEmotion = ref<Emotion>(EMOTIONS[0])
const showPrompt = ref(false)
const isCapturing = ref(false)
const showResult = ref<null | 'success' | 'retry'>(null)
const progress = ref([false, false, false])
const currentLevel = ref(0)
const particles = ref<Array<{ id: number; x: number; y: number }>>([])
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const route = useRoute()
const router = useRouter()

const updateTime = () => {
  const hour = new Date().getHours()
  timeOfDay.value = hour >= 6 && hour < 20 ? 'day' : 'night'
}

const isPageLoading = ref(true)
const isNavigating = ref(false)
const navError = ref('')

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000)
  // apply mode from query for session continuity
  const qMode = (route.query?.mode as string) || ''
  if (qMode === 'child' || qMode === 'parent') {
    sessionStorage.setItem('启明星-mode', qMode === 'child' ? 'child' : 'parent')
  }

  initCamera()
  setTimeout(() => { showPrompt.value = true }, 2000)
})

const initCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    if (videoRef.value) {
      const video = videoRef.value as HTMLVideoElement
      video.srcObject = stream as any
      const onReady = () => { isPageLoading.value = false; video.removeEventListener('loadeddata', onReady) }
      video.addEventListener('loadeddata', onReady)
    }
  } catch (err) {
    console.error('Camera access error:', err)
    isPageLoading.value = false
  }
}

const handleCapture = async () => {
  if (isCapturing.value) return
  isCapturing.value = true
  showResult.value = null
  try {
    const video = videoRef.value
    const canvas = canvasRef.value
    if (!video || !canvas) throw new Error('camera not ready')
    const width = (video as HTMLVideoElement).videoWidth || 480
    const height = (video as HTMLVideoElement).videoHeight || 360
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas ctx')
    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const faceRes = await apiClient.analyzeFace(dataUrl)
    if (faceRes.error || !faceRes.data?.has_face) { showResult.value = 'retry'; isCapturing.value = false; return }
    const microRes = await apiClient.analyzeMicroExpression(dataUrl, currentEmotion.value.name)
    if (microRes.error) { showResult.value = 'retry'; isCapturing.value = false; return }
    const matched = !!microRes.data?.matched_expected
    if (matched) {
      showResult.value = 'success'
      const newProgress = [...progress.value]
      newProgress[currentLevel.value] = true
      progress.value = newProgress
      setTimeout(() => {
        if (currentLevel.value < 2) {
          currentLevel.value += 1
          currentEmotion.value = EMOTIONS[currentLevel.value]
          showPrompt.value = false
          showResult.value = null
        }
        isCapturing.value = false
      }, 1200)
    } else { showResult.value = 'retry'; isCapturing.value = false }
  } catch (e) { showResult.value = 'retry'; isCapturing.value = false }
}

const handleRetry = () => { showResult.value = null }

const handleButtonPress = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const newParticles = Array.from({ length: 6 }, (_, i) => ({ id: Date.now() + i, x, y }))
  particles.value = [...particles.value, ...newParticles]
  setTimeout(() => { particles.value = particles.value.filter(p => !newParticles.find(np => np.id === p.id)) }, 400)
}

const particleStyle = (i: number) => ({
  left: '50%', top: '50%', backgroundColor: ['#FF6B6B','#FFE66D','#4ECDC4','#95E1D3','#F38181','#AA96DA'][i % 6],
  transform: `translate(-50%, -50%) rotate(${(i-1) * 30}deg)`, animation: 'particle 0.8s ease-out'
})

const buttonParticleStyle = (p: {x:number;y:number}, idx: number) => ({
  left: `${p.x}px`, top: `${p.y}px`, backgroundColor: ['#FF6B6B','#FFE66D','#4ECDC4','#95E1D3','#F38181','#AA96DA'][idx % 6],
  transform: `translate(-50%, -50%) rotate(${idx * 60}deg)`, animation: 'particle 0.4s ease-out'
})

const isLoggedIn = () => !!(localStorage.getItem('token') || sessionStorage.getItem('启明星-user'))
const hasPermission = () => true
const goBack = async () => {
  navError.value = ''
  if (!isLoggedIn()) { navError.value = '请先登录后再返回'; return }
  if (!hasPermission()) { navError.value = '无权限访问该页面'; return }
  isNavigating.value = true
  const mode = sessionStorage.getItem('启明星-mode') === 'parent' ? 'parent' : 'child'
  try {
    await router.push(`/social-decoder/${mode}`)
  } catch (e) {
    navError.value = '返回失败，请重试'
    isNavigating.value = false
  }
}
</script>

<style scoped>
.animate-in { animation: fade-in 0.3s ease-out; }
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes particle {
  0% { transform: translate(-50%, -50%) translateY(0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) translateY(-32px) scale(0); opacity: 0; }
}

.nav-toast { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: #fff; color: #333; padding: 8px 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); font-size: 13px; z-index: 60; }
</style>
