<template>
  <div class="min-h-screen flex items-center justify-center page-bg">
    <div class="vc-stage">
      <!-- 状态信息顶端居中 -->
      <div class="vc-topbar">
        <div class="vc-online"><span class="dot" /> 启明星在线</div>
        <div class="vc-time">{{ hhmmss }}</div>
      </div>

      <!-- 主画面：助手或本地，根据切换状态显示，占据约80%可视区域 -->
      <div class="vc-main" :class="[mainIsLocal ? 'local-main' : 'assistant-main', isSwapping ? 'swapping' : '']">
        <transition name="vcfade">
          <template v-if="mainIsLocal">
            <div>
              <video ref="localMain" autoplay playsinline muted></video>
              <div v-if="!hasCam" class="vc-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7a2 2 0 00-2-2H5A2 2 0 003 7v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z"/></svg>
                <button class="btn h-10 px-4 ripple mt-3" @click="requestCam">请求摄像头权限</button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="assistant-fake" :style="assistantStyle"></div>
          </template>
        </transition>

        <!-- 悬浮小窗：显示副画面，点击切换主副 -->
        <div class="vc-pip" @click="swapMain" :class="{'hoverable': true}">
          <div class="vc-pip-box">
            <transition name="vcfade">
              <template v-if="mainIsLocal">
                <div class="assistant-fake" :style="assistantStyle"></div>
              </template>
              <template v-else>
                <div class="pip-container">
                  <video ref="localPip" autoplay playsinline muted></video>
                  <div v-if="!hasCam" class="vc-pip-overlay" @click.stop="requestCam">点击开启摄像头</div>
                </div>
              </template>
            </transition>
          </div>
        </div>
      </div>

      <!-- 控制按钮底部居中 -->
      <div class="vc-controls">
        <button class="ctrl-btn ripple" :class="isMuted?'muted':''" @click="toggleMute" aria-label="静音">
          <svg width="24" height="24" viewBox="0 0 24 24" :fill="isMuted?'#999999':'#10AEFF'">
            <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
          </svg>
        </button>
        <button class="ctrl-btn ripple" :class="!camEnabled?'cam-off':''" @click="toggleCam" aria-label="摄像头">
          <svg width="24" height="24" viewBox="0 0 24 24" :fill="!camEnabled?'#999999':'#10AEFF'">
            <path v-if="camEnabled" d="M17 10.5V7a2 2 0 00-2-2H5A2 2 0 003 7v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z"/>
            <path v-else d="M17 10.5V7a2 2 0 00-2-2H5A2 2 0 003 7v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z M4 4l16 16"/>
          </svg>
        </button>
        <button class="ctrl-btn hang ripple" @click="hangup" aria-label="挂断">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M6.54 5.46a11.78 11.78 0 0110.92 0l2.04 1.02a1 1 0 01.5.87v3.3a1 1 0 01-.77.97l-3.12.78a1 1 0 01-1.03-.37l-1.61-2.14a10.04 10.04 0 00-3.86 0L8.99 12.89a1 1 0 01-1.03.37l-3.12-.78a1 1 0 01-.77-.97v-3.3a1 1 0 01.5-.87l1.97-1.03z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, type CSSProperties } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const localMain = ref<HTMLVideoElement|null>(null)
const localPip = ref<HTMLVideoElement|null>(null)
const localStream = ref<MediaStream|null>(null)
const isMuted = ref(false)
const camEnabled = ref(true)
const hasCam = ref(false)
const hhmmss = ref('00:00:00')
const timerId = ref<number|undefined>(undefined)
const timeOfDay = ref<'day'|'night'>('day')
const assistantStyle = ref<CSSProperties>({ transform: 'translateZ(0) scale(1)', opacity: 1 })
let rafId: number | null = null
const mainIsLocal = ref(false)
const isSwapping = ref(false)

const updateClock = () => {
  let sec = 0
  timerId.value = window.setInterval(() => { sec++; const h = String(Math.floor(sec/3600)).padStart(2,'0'); const m = String(Math.floor((sec%3600)/60)).padStart(2,'0'); const s = String(sec%60).padStart(2,'0'); hhmmss.value = `${h}:${m}:${s}` }, 1000)
}
const startAssistantMotion = () => {
  const step = () => { const tx = (Math.random()*2-1)*2; const ty = (Math.random()*2-1)*2; const sc = 1 + (Math.random()*0.02-0.01); assistantStyle.value = { transform: `translate3d(${tx}px,${ty}px,0) scale(${sc})`, willChange: 'transform' }; rafId = requestAnimationFrame(step) }
  rafId = requestAnimationFrame(step)
}
const stopAssistantMotion = () => { if (rafId) cancelAnimationFrame(rafId); rafId = null }

const requestCam = async () => {
  try {
    const status = await (navigator as any).permissions?.query?.({ name: 'camera' as any })
    if (status && status.state === 'denied') hasCam.value = false
  } catch {}
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
    localStream.value = stream
    bindStreamToRefs()
    hasCam.value = true
    const at = stream.getAudioTracks()[0]
    if (at) at.enabled = !isMuted.value
  } catch { hasCam.value = false }
}
const toggleMute = () => {
  isMuted.value = !isMuted.value
  const at = localStream.value?.getAudioTracks()?.[0]
  if (at) at.enabled = !isMuted.value
}
const toggleCam = () => {
  camEnabled.value = !camEnabled.value
  const vt = localStream.value?.getVideoTracks()?.[0]
  if (vt) vt.enabled = camEnabled.value
}
const swapMain = () => { isSwapping.value = true; setTimeout(() => { mainIsLocal.value = !mainIsLocal.value; isSwapping.value = false }, 300) }
const hangup = () => {
  localStream.value?.getTracks().forEach(t => t.stop())
  localStream.value = null
  stopAssistantMotion()
  if (timerId.value) clearInterval(timerId.value)
  router.push('/companion')
}
const bindStreamToRefs = () => {
  const stream = localStream.value
  if (!stream) return
  if (localMain.value) (localMain.value as any).srcObject = stream
  if (localPip.value) (localPip.value as any).srcObject = stream
}
const optimizeVideoStability = () => {
  const vids = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[]
  vids.forEach((video) => {
    video.preload = 'auto'
    ;(video as any).playsInline = true
    video.addEventListener('loadstart', () => { (video.style as any).visibility = 'visible' })
    video.addEventListener('error', () => { handleVideoError() })
  })
}
const handleVideoError = () => { setTimeout(() => { reconnectVideoStream() }, 1000) }
const reconnectVideoStream = () => { if (localStream.value) { bindStreamToRefs() } else { requestCam() } }
const handleResize = () => {
  const vids = Array.from(document.querySelectorAll('.vc-main video, .vc-pip-box video, video')) as HTMLVideoElement[]
  vids.forEach((v) => { v.style.objectFit = 'cover'; v.style.background = '#000' })
}
watch(mainIsLocal, async () => { await nextTick(); bindStreamToRefs() })
watch(hasCam, async () => { await nextTick(); bindStreamToRefs() })
onMounted(() => {
  const h = new Date().getHours(); timeOfDay.value = h>=20||h<6?'night':'day'
  updateClock()
  startAssistantMotion()
  requestCam()
  optimizeVideoStability()
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => { window.removeEventListener('resize', handleResize); hangup() })
</script>

<style scoped>
.vc-stage { width: min(100vw, 600px); position: relative; background: #FFF9F0; border-radius: var(--radius, 12px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden; }
.vc-topbar { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; z-index: 5; }
.vc-online { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #333; }
.vc-online .dot { width: 8px; height: 8px; border-radius: 50%; background: #09BB07; }
.vc-time { font-size: 14px; color: #999; }

.vc-main { position: relative; width: 100%; height: 80vh; max-height: 80vh; transition: transform 300ms ease-out, opacity 300ms ease-out; }
.vc-main.swapping { transform: scale(0.98); opacity: .92 }
.vcfade-enter-active, .vcfade-leave-active { transition: opacity 300ms ease-out, transform 300ms ease-out; }
.vcfade-enter-from, .vcfade-leave-to { opacity: 0; transform: scale(0.98); }
.assistant-main .assistant-fake { width: 100%; height: 100%; background: radial-gradient(circle at 50% 40%, rgba(198,224,255,.6), rgba(198,224,255,.2)); will-change: transform; }
.local-main video { width: 100%; height: 100%; object-fit: cover; display: block; }
.vc-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #1677FF; background: rgba(255,255,255,0.85); }

.vc-pip { position: absolute; top: 16px; right: 16px; width: 13.3%; min-width: 120px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 300ms ease-out, opacity 200ms ease; }
.vc-pip:hover { opacity: 0.9; transform: scale(0.98); }
.vc-pip-box { border-radius: 8px; overflow: hidden; }
.vc-pip-box { aspect-ratio: 9/16; }
.vc-pip-box video { width: 100%; height: 100%; object-fit: cover; display: block; }
.vc-pip-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #1677FF; background: rgba(255,255,255,0.7) }

.vc-controls { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 24px; z-index: 5; }
@media (max-width: 480px) { .vc-controls { gap: 16px } }
.ctrl-btn { width: 48px; height: 48px; border-radius: 8px; display: flex !important; align-items: center !important; justify-content: center !important; position: relative !important; background: #F5F5F5; transition: transform var(--duration, .2s), opacity var(--duration, .2s); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.ctrl-btn:hover { transform: scale(1.05); opacity: .9 }
.ctrl-btn:active { transform: scale(0.95) }
.ctrl-btn svg { color: currentColor }
.ctrl-btn svg, .ctrl-btn i { position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; }
.ctrl-btn.muted { background: #E6E6E6 }
.ctrl-btn.cam-off { background: #E6E6E6 }
.ctrl-btn.hang { background: #FA5151; color: #fff }
.vc-main video, .vc-pip-box video, video { width: 100% !important; height: 100% !important; object-fit: cover !important; background: #000 !important; display: block !important; border: none !important; outline: none !important; padding: 0 !important; margin: 0 !important; }
.vc-main { overflow: hidden; }
.vc-pip-box { overflow: hidden; }
.video-call-container { width: 100vw !important; height: 100vh !important; position: fixed !important; top: 0 !important; left: 0 !important; overflow: hidden !important; background: #000 !important; }
.video-stream-container, .video-wrapper, .stream-area { width: 100% !important; height: 100% !important; position: relative !important; display: flex !important; align-items: center !important; justify-content: center !important; background: #000 !important; }
.video-call-container video { width: 100% !important; height: 100% !important; object-fit: cover !important; background: #000 !important; position: absolute !important; top: 0 !important; left: 0 !important; }
.local-video, .pip-video { width: 20% !important; height: 25% !important; min-width: 150px !important; min-height: 200px !important; object-fit: cover !important; border-radius: 8px !important; border: 2px solid rgba(255,255,255,0.3) !important; background: #000 !important; }
@media (max-width: 768px) { .video-call-container { height: 100dvh !important; } .local-video { width: 30% !important; height: 20% !important; } }
.video-call-container * { animation: none !important; transition: none !important; }
.video-call-container { transform: translateZ(0); backface-visibility: hidden; perspective: 1000; will-change: auto; isolation: isolate; }
.video-call-container video { transform: translateZ(0); backface-visibility: hidden; }
.video-call-container video::-webkit-media-controls { animation: none !important; }
.video-call-container canvas { image-rendering: crisp-edges; transform: translateZ(0); }
.video-call-container { transform: translate3d(0,0,0); filter: none !important; mix-blend-mode: normal !important; opacity: 1 !important; box-sizing: border-box !important; display: block !important; }
@supports (-webkit-overflow-scrolling: touch) { .video-call-container { -webkit-overflow-scrolling: touch; -webkit-transform: translate3d(0,0,0); } }
@media screen and (-webkit-min-device-pixel-ratio: 0) { .video-call-container video { -webkit-transform: translateZ(0); -webkit-backface-visibility: hidden; } }
.vc-main.assistant-main { width: 100%; height: 86vh; position: relative; overflow: hidden; }
.assistant-fake video { width: 100%; height: 100%; object-fit: contain; }
.vc-main { transform: translateZ(0); }
@media (max-width: 768px) { .vc-main.assistant-main { height: 86dvh; } .assistant-fake video { min-width: 100%; min-height: 100%; object-fit: contain; } }
</style>
