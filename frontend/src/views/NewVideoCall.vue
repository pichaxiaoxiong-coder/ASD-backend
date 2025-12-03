<template>
  <!-- 视频通话主容器：承载背景、视频区、控制栏与通话信息 -->
  <div ref="containerRef" class="video-call-container new-video-call-container" :style="backgroundStyle" @click="onContainerClick">
    <!-- 虚拟背景：覆盖全屏，使用图片作为背景 -->
    <div class="virtual-background ai-virtual-background" :style="backgroundStyle" />
    <div class="call-bg-base" :style="theme.darkMode ? { background: '#490b95' } : undefined"></div>
    <div class="call-bg-sync-layer">
      <BackgroundDecorations :is-dark-mode="theme.darkMode" />
    </div>
    <div class="click-effect-layer" ref="effectLayerRef"></div>

    <!-- 视频显示区域：AI角色 + 本地视频（画中画） -->
    

  <div class="video-area video-stream-container">
      <div class="remote-ai-container">
        <video id="remoteVideo" autoplay playsinline></video>
        <div class="ai-character" ref="aiCharacterRef">
          <img :src="aiCharacterImage" alt="AI助手" ref="aiImageRef" />
        </div>
      </div>
      <div class="local-video-preview debug-border">
        <span class="connection-status" aria-hidden="true"></span>
        <video id="localVideo" ref="localPreviewRef" autoplay playsinline muted></video>
        <div class="embedded-controls">
          <button class="embedded-btn mic-toggle" :data-state="isMuted ? 'off' : 'on'" @click.stop="toggleMicrophone" @keydown.space.prevent="toggleMicrophone" @keydown.enter.prevent="toggleMicrophone" :aria-label="isMuted ? '麦克风已关闭' : '麦克风已开启'" :title="audioAvailable ? '麦克风' : '麦克风不可用'" :disabled="!audioAvailable || !isCallActive">
            <svg class="embedded-icon icon-mic" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <span class="disabled-line"></span>
          </button>
          <button class="embedded-btn camera-toggle" :data-state="camEnabled ? 'on' : 'off'" @click.stop="toggleCamera" @keydown.space.prevent="toggleCamera" @keydown.enter.prevent="toggleCamera" :aria-label="camEnabled ? '摄像头已开启' : '摄像头已关闭'" :title="videoAvailable ? '摄像头' : '摄像头不可用'" :disabled="!videoAvailable || !isCallActive">
            <svg class="embedded-icon icon-camera" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"/>
            </svg>
            <span class="disabled-line"></span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="reconnecting" class="reconnecting-indicator">设备重连中...</div>

    <div class="page-hidden-notice" id="pageHiddenNotice">页面在后台运行</div>
    <div class="call-duration" id="callDuration" :class="{ show: isCallActive }">{{ durationText }}</div>
    <div class="network-status-indicator" id="networkIndicator" title="网络状态"></div>
    <div class="quality-indicator" id="qualityIndicator" title="通话质量"></div>

  <div class="bottom-controls">
      <button class="hangup-btn" @click="endCall" @keydown.space.prevent="endCall" @keydown.enter.prevent="endCall" title="挂断通话" aria-label="挂断通话" :disabled="!isOnline || !isCallActive">
        <svg class="hangup-icon" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z"/>
        </svg>
        <span class="btn-text">挂断</span>
      </button>
    </div>
    <div v-if="hasError" class="video-error">
      <div class="error-content">
        <span class="error-icon">!</span>
        <span class="error-text">{{ errorMessage }}</span>
        <button class="error-retry" @click="retryInit">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'

// 占位资源路径：后续可替换为真实路径
const aiCharacterImage = '/images/star-mascot.png'

// 基础状态与引用
const router = useRouter()
const theme = useThemeStore()
const backgroundStyle = computed(() => ({ background: theme.darkMode ? '#490b95' : '#89b6ef' }))
onMounted(() => { theme.load() })
const containerRef = ref<HTMLDivElement | null>(null)
const localPreviewRef = ref<HTMLVideoElement | null>(null)
const aiCharacterRef = ref<HTMLDivElement | null>(null)
const aiImageRef = ref<HTMLImageElement | null>(null)
const localStream = ref<MediaStream | null>(null)
const isMuted = ref(false)
const camEnabled = ref(true)
const callSeconds = ref(0)
let timerId: number | null = null
const statusText = ref('正在连接摄像头与麦克风…')
const ERROR_TYPES = { PERMISSION_DENIED: 'PERMISSION_DENIED', DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND', DEVICE_IN_USE: 'DEVICE_IN_USE', NETWORK_ERROR: 'NETWORK_ERROR', UNKNOWN: 'UNKNOWN' }
const hasError = ref(false)
const errorType = ref<string | null>(null)
const errorMessage = ref('')
const audioAvailable = ref(true)
const videoAvailable = ref(true)
let deviceChangeBound = false
let lastVideoState: boolean | null = null
let lastAudioState: boolean | null = null
const reconnecting = ref(false)
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
const onlineHandler = () => handleNetworkChange(true)
const offlineHandler = () => handleNetworkChange(false)
const isCallActive = ref(true)
const effectLayerRef = ref<HTMLElement | null>(null)
const onContainerClick = (e: MouseEvent) => {
  const layer = effectLayerRef.value
  if (!layer) return
  const rect = layer.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const dot = document.createElement('div')
  dot.className = 'sparkle-dot'
  dot.style.left = x + 'px'
  dot.style.top = y + 'px'
  layer.appendChild(dot)
  dot.addEventListener('animationend', () => { try { dot.remove() } catch {} })
}
const callStats = ref({ startTime: null as number | null, endTime: null as number | null, duration: 0, events: [] as Array<{ type: string; message: string; timestamp: number; time: string }>, errorCount: 0, deviceChangeCount: 0, micToggles: 0, cameraToggles: 0, micTotalOnTime: 0, cameraTotalOnTime: 0, micLastToggleTime: null as number | null, cameraLastToggleTime: null as number | null })
const networkStats = ref({ changeCount: 0, onlineTime: 0, offlineTime: 0, lastState: (typeof navigator !== 'undefined' ? navigator.onLine : true), lastChangeTime: Date.now(), startTime: Date.now() })
const quality = ref({ level: 'unknown', lastCheck: 0 })
let qualityTimerId: number | null = null
const logEvent = (type: string, message: string) => { const e = { type, message, timestamp: Date.now(), time: new Date().toLocaleTimeString() }; callStats.value.events.push(e); if (callStats.value.events.length > 50) callStats.value.events.shift(); console.log(`[${e.time}] ${message}`) }
const logError = (errorType: string, error: any) => { callStats.value.errorCount++; logEvent('error', `${errorType}: ${error?.message ?? error}`) }
const logDeviceChange = (deviceType: 'video' | 'audio', available: boolean) => { callStats.value.deviceChangeCount++; logEvent('device_change', `${deviceType === 'video' ? '摄像头' : '麦克风'} ${available ? '可用' : '不可用'}`) }
const startCallStats = () => { callStats.value.startTime = Date.now(); logEvent('call_started', '通话开始'); if (!callStats.value.micLastToggleTime && !isMuted.value) callStats.value.micLastToggleTime = Date.now(); if (!callStats.value.cameraLastToggleTime && camEnabled.value) callStats.value.cameraLastToggleTime = Date.now() }
const printCallSummary = () => { if (callStats.value.startTime == null || callStats.value.endTime == null) return; const summary = { '开始时间': new Date(callStats.value.startTime).toLocaleTimeString(), '结束时间': new Date(callStats.value.endTime).toLocaleTimeString(), '通话时长': `${callStats.value.duration}秒`, '设备变化次数': callStats.value.deviceChangeCount, '错误次数': callStats.value.errorCount, '事件总数': callStats.value.events.length }; console.log('通话统计摘要:', summary) }
const endCallStats = () => { callStats.value.endTime = Date.now(); const st = callStats.value.startTime ?? callStats.value.endTime; callStats.value.duration = Math.floor((callStats.value.endTime - st) / 1000); const now = callStats.value.endTime; if (callStats.value.micLastToggleTime && !isMuted.value) callStats.value.micTotalOnTime += now - callStats.value.micLastToggleTime; if (callStats.value.cameraLastToggleTime && camEnabled.value) callStats.value.cameraTotalOnTime += now - callStats.value.cameraLastToggleTime; logEvent('call_ended', `通话结束，时长: ${callStats.value.duration}秒`); printCallSummary(); printDeviceStats(); printNetworkStats(); try { getCallStats() } catch {} try { getQualityStats() } catch {} }
const logMicToggle = (isOn: boolean) => { callStats.value.micToggles++; const now = Date.now(); const prevOn = !isMuted.value; if (callStats.value.micLastToggleTime) { const diff = now - callStats.value.micLastToggleTime; if (prevOn) callStats.value.micTotalOnTime += diff } callStats.value.micLastToggleTime = now; logEvent('mic_toggle', `麦克风${isOn ? '开启' : '关闭'} (总切换: ${callStats.value.micToggles}次)`) }
const logCameraToggle = (isOn: boolean) => { callStats.value.cameraToggles++; const now = Date.now(); const prevOn = camEnabled.value; if (callStats.value.cameraLastToggleTime) { const diff = now - callStats.value.cameraLastToggleTime; if (prevOn) callStats.value.cameraTotalOnTime += diff } callStats.value.cameraLastToggleTime = now; logEvent('camera_toggle', `摄像头${isOn ? '开启' : '关闭'} (总切换: ${callStats.value.cameraToggles}次)`) }
const getDeviceStats = () => { let micOnTime = callStats.value.micTotalOnTime; let cameraOnTime = callStats.value.cameraTotalOnTime; const now = Date.now(); if (callStats.value.micLastToggleTime && !isMuted.value) micOnTime += now - callStats.value.micLastToggleTime; if (callStats.value.cameraLastToggleTime && camEnabled.value) cameraOnTime += now - callStats.value.cameraLastToggleTime; return { micToggles: callStats.value.micToggles, cameraToggles: callStats.value.cameraToggles, micOnTime: Math.floor(micOnTime / 1000), cameraOnTime: Math.floor(cameraOnTime / 1000) } }
const printDeviceStats = () => { const stats = getDeviceStats(); console.log('设备统计:', stats) }
const getCallStats = () => { return { ...callStats.value, summary: { '通话时长': callStats.value.duration, '设备变化': callStats.value.deviceChangeCount, '错误次数': callStats.value.errorCount } } }

const generateSimpleSummary = () => {
  const duration = callStats.value.duration || 0
  const micToggles = callStats.value.micToggles || 0
  const cameraToggles = callStats.value.cameraToggles || 0
  const errors = callStats.value.errorCount || 0
  return { duration: `${duration}秒`, micToggles: `${micToggles}次`, cameraToggles: `${cameraToggles}次`, errors }
}

const showSimpleSummary = () => {
  const s = generateSimpleSummary()
  const text = (`通话总结：\n- 时长：${s.duration}\n- 麦克风切换：${s.micToggles}\n- 摄像头切换：${s.cameraToggles}\n- 错误次数：${s.errors}`).trim()
  console.log(text)
  const container = containerRef.value
  if (!container) return
  const div = document.createElement('div')
  div.className = 'simple-summary'
  div.textContent = text
  container.appendChild(div)
  setTimeout(() => { div.remove() }, 3000)
}

class VideoCallController {
  state: { isMicOn: boolean; isCameraOn: boolean; isCallActive: boolean }
  deviceState: { videoAvailable: boolean; audioAvailable: boolean }
  networkState: { isOnline: boolean }
  callStatsRef = callStats
  constructor() {
    this.state = { isMicOn: !isMuted.value, isCameraOn: camEnabled.value, isCallActive: isCallActive.value }
    this.deviceState = { videoAvailable: videoAvailable.value, audioAvailable: audioAvailable.value }
    this.networkState = { isOnline: isOnline.value }
  }
  async init() { try { await checkDevices() } catch {} }
  async initMedia() { await initializeMediaStream() }
  toggleMic() { toggleMicrophone() }
  toggleCamera() { toggleCamera() }
  async hangupCall() { endCall() }
  async checkDevices() { await checkDevices() }
  handleNetworkChange(online: boolean) { handleNetworkChange(online) }
  generateSimpleSummary() { return generateSimpleSummary() }
  showSimpleSummary() { showSimpleSummary() }
}

const controller = new VideoCallController()

const reconnectCamera = async (): Promise<boolean> => {
  try {
    reconnecting.value = true
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    const newTrack = stream.getVideoTracks()[0]
    if (!newTrack) { reconnecting.value = false; return false }
    if (!localStream.value) {
      localStream.value = new MediaStream()
    }
    localStream.value.getVideoTracks().forEach(t => { try { t.stop() } catch {} localStream.value?.removeTrack(t) })
    localStream.value.addTrack(newTrack)
    if (localPreviewRef.value) {
      localPreviewRef.value.srcObject = localStream.value
      localPreviewRef.value.style.opacity = '1'
    }
    camEnabled.value = true
    reconnecting.value = false
    return true
  } catch (e) {
    reconnecting.value = false
    return false
  }
}

const reconnectMicrophone = async (): Promise<boolean> => {
  try {
    reconnecting.value = true
    const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
    const newTrack = stream.getAudioTracks()[0]
    if (!newTrack) { reconnecting.value = false; return false }
    if (!localStream.value) {
      localStream.value = new MediaStream()
    }
    localStream.value.getAudioTracks().forEach(t => { try { t.stop() } catch {} localStream.value?.removeTrack(t) })
    localStream.value.addTrack(newTrack)
    newTrack.enabled = !isMuted.value
    if (localPreviewRef.value && localPreviewRef.value.srcObject !== localStream.value) {
      localPreviewRef.value.srcObject = localStream.value
    }
    reconnecting.value = false
    return true
  } catch (e) {
    reconnecting.value = false
    return false
  }
}

const autoReconnectDevices = async () => {
  try {
    if (videoAvailable.value && camEnabled.value) {
      const vt = localStream.value?.getVideoTracks()?.[0]
      const videoConnected = !!vt && vt.readyState === 'live'
      if (!videoConnected) {
        const ok = await reconnectCamera()
        showDeviceNotification(ok ? '摄像头已重新连接' : '摄像头重连失败', ok ? 'success' : 'error')
        try { logEvent('camera_reconnect', ok ? '摄像头已重新连接' : '摄像头重连失败') } catch {}
      }
    }
    if (audioAvailable.value && !isMuted.value) {
      const at = localStream.value?.getAudioTracks()?.[0]
      const audioConnected = !!at && at.readyState === 'live'
      if (!audioConnected) {
        const ok = await reconnectMicrophone()
        showDeviceNotification(ok ? '麦克风已重新连接' : '麦克风重连失败', ok ? 'success' : 'error')
        try { logEvent('mic_reconnect', ok ? '麦克风已重新连接' : '麦克风重连失败') } catch {}
      }
    }
  } catch {}
}

// 通话时长 MM:SS
const durationText = computed(() => {
  const m = String(Math.floor(callSeconds.value / 60)).padStart(2, '0')
  const s = String(callSeconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

// 初始化媒体流
const initializeMediaStream = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showError('浏览器不支持视频通话', ERROR_TYPES.UNKNOWN)
      return
    }
    statusText.value = '请求设备权限…'
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch((error) => { handleMediaError(error); throw error })
    localStream.value = stream
    statusText.value = '通话已连接'
    const at = stream.getAudioTracks()[0]
    if (at) at.enabled = !isMuted.value
    const vt = stream.getVideoTracks()[0]
    if (vt) vt.enabled = camEnabled.value
    if (localPreviewRef.value) {
      localPreviewRef.value.srcObject = stream
    }
  } catch (err) {
    handleMediaError(err as any)
  }
}

const checkDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(d => d.kind === 'videoinput')
    const audioDevices = devices.filter(d => d.kind === 'audioinput')
    const vAvail = videoDevices.length > 0
    const aAvail = audioDevices.length > 0
    if (lastVideoState === null) lastVideoState = vAvail
    if (lastAudioState === null) lastAudioState = aAvail
    if (vAvail !== lastVideoState) {
      if (!vAvail) { showDeviceNotification('摄像头已断开'); try { logDeviceChange('video', vAvail) } catch {}; if (camEnabled.value) setCamera(false) } else { showDeviceNotification('摄像头已连接'); try { logDeviceChange('video', vAvail) } catch {} }
      lastVideoState = vAvail
    }
    if (aAvail !== lastAudioState) {
      if (!aAvail) { showDeviceNotification('麦克风已断开'); try { logDeviceChange('audio', aAvail) } catch {}; if (!isMuted.value) setMic(false) } else { showDeviceNotification('麦克风已连接'); try { logDeviceChange('audio', aAvail) } catch {} }
      lastAudioState = aAvail
    }
    videoAvailable.value = vAvail
    audioAvailable.value = aAvail
    await autoReconnectDevices()
  } catch (e) {
    console.error('检查设备失败:', e)
  }
}

const setupDeviceListener = () => {
  if (navigator.mediaDevices && (navigator.mediaDevices as any).addEventListener && !deviceChangeBound) {
    (navigator.mediaDevices as any).addEventListener('devicechange', () => { checkDevices() })
    deviceChangeBound = true
  }
}

// 绑定本地预览到 <video>

// 切换麦克风
const toggleMicrophone = () => {
  if (!audioAvailable.value) { showDeviceNotification('麦克风不可用'); return }
  const newOn = isMuted.value
  try { logMicToggle(newOn) } catch {}
  setMic(newOn)
}

// 切换摄像头
const toggleCamera = () => {
  if (!videoAvailable.value) { showDeviceNotification('摄像头不可用'); return }
  const newOn = !camEnabled.value
  try { logCameraToggle(newOn) } catch {}
  setCamera(newOn)
}

// 全屏控制

const cleanupResources = () => {
  try { stopTimer() } catch {}
  try { if (qualityTimerId) { clearInterval(qualityTimerId); qualityTimerId = null } } catch {}
  try {
    localStream.value?.getTracks().forEach(t => t.stop())
    localStream.value = null
  } catch {}
  try { if (localPreviewRef.value) localPreviewRef.value.srcObject = null } catch {}
  isCallActive.value = false
  try { document.fullscreenElement && document.exitFullscreen() } catch {}
}

// 结束通话
const endCall = () => {
  if (!window.confirm('确定要结束通话吗？')) return
  try { endCallStats() } catch {}
  try { showSimpleSummary() } catch {}
  try { stopTimer() } catch {}
  try {
    localStream.value?.getTracks().forEach(t => t.stop())
    localStream.value = null
  } catch {}
  try { if (localPreviewRef.value) localPreviewRef.value.srcObject = null } catch {}
  isCallActive.value = false
  try { window.alert('通话已结束') } catch {}
  try { document.fullscreenElement && document.exitFullscreen() } catch {}
  router.push('/companion')
}

// 媒体错误处理
const handleMediaError = (e: any) => {
  let t = ERROR_TYPES.UNKNOWN
  let msg = '无法访问摄像头或麦克风'
  if (e && e.name === 'NotFoundError') { t = ERROR_TYPES.DEVICE_NOT_FOUND; msg = '未找到摄像头或麦克风设备' }
  else if (e && e.name === 'NotAllowedError') { t = ERROR_TYPES.PERMISSION_DENIED; msg = '请允许摄像头和麦克风权限' }
  else if (e && e.name === 'NotReadableError') { t = ERROR_TYPES.DEVICE_IN_USE; msg = '设备已被其他应用占用' }
  try { logError(t, e) } catch {}
  showError(msg, t)
}

const showError = (message: string, type?: string) => {
  hasError.value = true
  errorMessage.value = message
  errorType.value = type ?? null
}

const retryInit = async () => {
  hasError.value = false
  errorMessage.value = ''
  errorType.value = null
  await initializeMediaStream()
}

const setMic = (on: boolean) => {
  isMuted.value = !on
  const at = localStream.value?.getAudioTracks()?.[0]
  if (at) at.enabled = on
  try { logEvent('mic_state', on ? '麦克风开启' : '麦克风关闭') } catch {}
}

const setCamera = (on: boolean) => {
  camEnabled.value = on
  const vt = localStream.value?.getVideoTracks()?.[0]
  if (vt) vt.enabled = on
  if (localPreviewRef.value) localPreviewRef.value.classList.toggle('camera-off', !on)
  try { logEvent('camera_state', on ? '摄像头开启' : '摄像头关闭') } catch {}
}

// 计时器
const startTimer = () => { stopTimer(); timerId = window.setInterval(() => { callSeconds.value++ }, 1000) as unknown as number }
const stopTimer = () => { if (timerId) { clearInterval(timerId); timerId = null } }

// 全屏状态同步

onMounted(async () => {
  await initializeMediaStream()
  startTimer()
  startCallStats()
  await checkDevices()
  setupDeviceListener()
  setupNetworkListeners()
  startQualityMonitor()
  try { await controller.init() } catch {}
  try { window.addEventListener('beforeunload', beforeUnloadHandler) } catch {}
  try { document.addEventListener('visibilitychange', handleVisibilityChange) } catch {}
  try { updateNetworkIndicator() } catch {}
  try {
    const img = aiImageRef.value
    const el = aiCharacterRef.value
    const applySize = () => {
      if (!img || !el) return
      const nw = (img as any).naturalWidth || img.width
      const nh = (img as any).naturalHeight || img.height
      if (!nw || !nh) return
      const base = Math.min(nw, nh)
      const max = Math.min(160, Math.floor((containerRef.value?.clientWidth || 600) * 0.2))
      const min = 110
      const size = Math.max(min, Math.min(max, base))
      el.style.width = `${size}px`
      el.style.height = `${size}px`
    }
    if (img && !img.complete) { img.addEventListener('load', applySize, { once: true }) } else { applySize() }
    window.addEventListener('resize', applySize)
  } catch {}
})

const showDeviceNotification = (message: string, type?: 'success' | 'error') => {
  const container = containerRef.value
  if (!container) return
  const notification = document.createElement('div')
  notification.className = 'device-notification'
  notification.textContent = message
  if (type) notification.classList.add(type)
  container.appendChild(notification)
  setTimeout(() => { notification.classList.add('show') }, 10)
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => { notification.remove() }, 300)
  }, 3000)
}

const setupNetworkListeners = () => {
  try {
    window.addEventListener('online', onlineHandler)
    window.addEventListener('offline', offlineHandler)
  } catch {}
}

const handleNetworkChange = (online: boolean) => {
  const now = Date.now()
  const diff = now - networkStats.value.lastChangeTime
  if (networkStats.value.lastState) { networkStats.value.onlineTime += diff } else { networkStats.value.offlineTime += diff }
  networkStats.value.lastState = online
  networkStats.value.lastChangeTime = now
  networkStats.value.changeCount++
  isOnline.value = online
  showNetworkToast(online ? '网络已连接' : '网络已断开')
  try { logEvent('network_change', online ? '网络已连接' : '网络已断开') } catch {}
  try { updateNetworkIndicator() } catch {}
}

const showNetworkToast = (message: string) => {
  const container = containerRef.value
  if (!container) return
  const toast = document.createElement('div')
  toast.className = 'network-toast'
  toast.textContent = message
  container.appendChild(toast)
  setTimeout(() => { toast.classList.add('show') }, 10)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => { toast.remove() }, 300)
  }, 3000)
}

const handleVisibilityChange = () => {
  const hidden = document.hidden
  const notice = containerRef.value?.querySelector('#pageHiddenNotice') as HTMLDivElement | null
  if (notice) notice.style.display = hidden ? 'block' : 'none'
  const v = localPreviewRef.value
  if (v && isCallActive.value) {
    if (hidden && !v.paused) { try { v.pause() } catch {} }
    if (!hidden && v.paused) { v.play().catch(() => {}) }
  }
}

const beforeUnloadHandler = (event: any) => {
  if (isCallActive.value) {
    try { event.preventDefault() } catch {}
    try { event.returnValue = '通话仍在进行中，确定要离开吗？' } catch {}
    return '通话仍在进行中，确定要离开吗？'
  }
}

const getNetworkStats = () => {
  const now = Date.now()
  const currentDuration = now - networkStats.value.lastChangeTime
  let finalOnlineTime = networkStats.value.onlineTime
  let finalOfflineTime = networkStats.value.offlineTime
  if (networkStats.value.lastState) { finalOnlineTime += currentDuration } else { finalOfflineTime += currentDuration }
  return { changeCount: networkStats.value.changeCount, onlineTime: Math.floor(finalOnlineTime / 1000), offlineTime: Math.floor(finalOfflineTime / 1000), lastState: networkStats.value.lastState ? '在线' : '离线', currentState: isOnline.value ? '在线' : '离线' }
}

const printNetworkStats = () => { const stats = getNetworkStats(); console.log('网络统计:', stats) }

const updateNetworkIndicator = () => {
  const indicator = containerRef.value?.querySelector('#networkIndicator') as HTMLDivElement | null
  if (!indicator) return
  const online = isOnline.value
  indicator.className = 'network-status-indicator ' + (online ? 'online' : 'offline')
  indicator.title = online ? '网络在线' : '网络离线'
}

const updateQualityDisplay = (level: 'good' | 'fair' | 'poor') => {
  const indicator = containerRef.value?.querySelector('#qualityIndicator') as HTMLDivElement | null
  if (!indicator) return
  indicator.className = 'quality-indicator ' + level
  indicator.title = level === 'good' ? '质量良好' : level === 'fair' ? '质量一般' : '质量较差'
}

const logQualityChange = (level: 'good' | 'fair' | 'poor') => {
  const text = level === 'good' ? '质量良好' : level === 'fair' ? '质量一般' : '质量较差'
  try { logEvent('quality_change', text) } catch {}
}

const getQualityStats = () => {
  return { level: quality.value.level, lastCheck: quality.value.lastCheck }
}

const checkQuality = () => {
  const online = isOnline.value
  const videoOk = videoAvailable.value && camEnabled.value
  const audioOk = audioAvailable.value && !isMuted.value
  let level: 'good' | 'fair' | 'poor' = 'good'
  if (!online || (!videoOk && !audioOk)) { level = 'poor' }
  else if (!videoOk || !audioOk || networkStats.value.changeCount > 3) { level = 'fair' }
  if (quality.value.level !== level) { logQualityChange(level); updateQualityDisplay(level) }
  quality.value.level = level
  quality.value.lastCheck = Date.now()
}

const startQualityMonitor = () => {
  try { if (qualityTimerId) { clearInterval(qualityTimerId) } } catch {}
  qualityTimerId = window.setInterval(() => { checkQuality() }, 5000) as unknown as number
  try { checkQuality() } catch {}
}

onBeforeUnmount(() => {
  try { window.removeEventListener('online', onlineHandler); window.removeEventListener('offline', offlineHandler) } catch {}
  try { window.removeEventListener('beforeunload', beforeUnloadHandler) } catch {}
  try { document.removeEventListener('visibilitychange', handleVisibilityChange) } catch {}
  try { if (isCallActive.value && !callStats.value.endTime) endCallStats() } catch {}
  cleanupResources()
})
</script>

<style scoped>
/* 容器与背景 */
.video-call-container { position: relative; width: 100vw; height: 100vh; background: #000; overflow: hidden; }
.new-video-call-container { width: 100vw; height: 100vh; background: #fafafa; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ai-virtual-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ec 100%) !important; z-index: 1; }
.call-bg-base { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.call-bg-sync-layer { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.click-effect-layer { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.sparkle-dot { position: absolute; left: 0; top: 0; width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0) 100%); transform: translate(-50%, -50%) scale(0.6); animation: dot-sparkle 600ms ease-out forwards; box-shadow: 0 0 8px rgba(255,255,255,0.7); }
@keyframes dot-sparkle { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6) } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1) } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.4) } }

/* 视频区域：居中显示 AI 角色与本地视频 */
.video-stream-container { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 2; padding: 20px; }
.video-area { position: relative; width: 100%; display: flex; align-items: center; justify-content: center; z-index: 2; }
.remote-ai-container { width: 100%; max-width: 600px; height: 60vh; max-height: 500px; display: flex; align-items: center; justify-content: center; margin: 0 auto; position: relative; background: transparent !important; border: none !important; }
.ai-character { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; pointer-events: none; border-radius: 0 !important; overflow: visible !important; background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; box-shadow: none !important; border: none !important; transition: all 0.3s ease; }
.ai-character > * { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.ai-character img { animation: star-sway 3s ease-in-out infinite; transform-origin: 50% 50%; }
@keyframes star-sway { 0% { transform: translateY(0) rotate(0deg) } 25% { transform: translateY(-4px) rotate(-2deg) } 50% { transform: translateY(0) rotate(0deg) } 75% { transform: translateY(4px) rotate(2deg) } 100% { transform: translateY(0) rotate(0deg) } }
.star-character { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 60%; max-height: 60%; object-fit: contain; border: 2px solid transparent; border-radius: 12px; box-shadow: none !important; outline: none !important; background: transparent !important; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; pointer-events: none; }

/* 本地视频画中画 */
.local-video { position: absolute; bottom: 20px; right: 20px; width: 24%; height: 28%; min-width: 160px; min-height: 200px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.6); background: #000; box-shadow: 0 6px 24px rgba(0,0,0,0.35); object-fit: cover; z-index: 2; }

/* 通话信息 */
.call-info { text-align: center; color: #666; z-index: 15; background: rgba(255,255,255,0.8); padding: 12px 24px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.05); margin-bottom: 20px; width: fit-content; margin-left: auto; margin-right: auto; display: grid; gap: 4px; }
.call-duration { font-size: 16px; font-weight: 600; color: #333; }
.call-status { font-size: 12px; opacity: 0.8; }

 /* 本地视频预览框 */
.local-video-preview { position: absolute; top: 20px; right: 20px; width: 200px; height: 150px; border-radius: 12px; overflow: hidden; border: 2px solid #F0F0F0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); z-index: 100; background: #000; }
 .video-call-container .local-video-preview { border: 2px solid #F0F0F0 !important; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) }
 #localVideo { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease; }
 #localVideo.camera-off { opacity: 0.3; }
 /* 嵌入式控制按钮 */
 .embedded-controls { position: absolute; left: 8px; bottom: 8px; display: flex; gap: 6px; z-index: 10; }
 .embedded-btn { width: 24px; height: 24px; border-radius: 4px; border: none; background: rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; padding: 0; transition: background-color 0.2s ease; }
 .embedded-btn:hover { background: rgba(0, 0, 0, 0.4); }
 .embedded-btn:active { background: rgba(0, 0, 0, 0.5); }
 .embedded-icon { width: 18px; height: 18px; fill: #fff; transition: fill 0.2s ease; position: relative; z-index: 2; }
 .embedded-btn[data-state="off"] .embedded-icon { fill: rgba(255, 255, 255, 0.5); }
 .disabled-line { display: none; position: absolute; top: 50%; left: 50%; width: 20px; height: 2px; background-color: rgba(255, 255, 255, 0.8); transform: translate(-50%, -50%) rotate(-45deg); transform-origin: center; z-index: 1; border-radius: 1px; }
 .embedded-btn[data-state="off"] .disabled-line { display: block; }
 .embedded-btn[data-state="off"]:active .disabled-line { background-color: rgba(0, 0, 0, 0.5); }
 .embedded-btn[data-state="off"]:active .embedded-icon { fill: rgba(0, 0, 0, 0.5); }
 /* 底部控制区域 */
 .bottom-controls { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; justify-content: center; width: 100%; z-index: 100; }
 .hangup-btn { width: 70px; height: 70px; border-radius: 50%; border: none; background: #ff3b30; color: white; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4); }
.hangup-btn:hover { background: #ff5e54; transform: scale(1.05); }
.hangup-btn:active { transform: scale(0.95); }
.hangup-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.hangup-btn:disabled:hover { transform: none; background: #ff3b30; }
 .hangup-icon { width: 24px; height: 24px; }
 .btn-text { margin-top: 4px; font-size: 12px; font-weight: 500; }

.new-video-call-container { background: #f8f9fa !important; }
.ai-virtual-background { background-color: #e9ecef !important; }
 .controls-container { background: transparent !important }
.call-info { background: rgba(255, 255, 255, 0.8) !important; color: #333 !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; }
.local-video { border: 2px solid #F0F0F0 !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important; }

.new-video-call-container { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important; }
.ai-virtual-background { background: linear-gradient(135deg, #ffffff 0%, #f1f3f4 100%) !important; }
.video-stream-container { background: transparent !important; }
.video-call-container .remote-ai-container { border: none !important; outline: none !important; box-shadow: none !important; }
.controls-container { background: rgba(255, 255, 255, 0.95) !important; backdrop-filter: blur(15px) !important; border: 1px solid rgba(0, 0, 0, 0.08) !important; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05) !important; }
.control-btn { background: rgba(255, 255, 255, 0.8) !important; color: #2d3748 !important; border: 1px solid rgba(0, 0, 0, 0.08) !important; transition: all 0.2s ease !important; }
.control-btn:hover { background: rgba(255, 255, 255, 1) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important; transform: translateY(-2px) !important; }
.call-info { background: rgba(255, 255, 255, 0.9) !important; color: #2d3748 !important; border: 1px solid rgba(0, 0, 0, 0.08) !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important; }

@media (max-width: 768px) { .local-video-preview { top: 12px; right: 12px; border-width: 1px; border-color: #F0F0F0 } }

/* 响应式适配 */
@media (max-width: 768px) {
  .video-stream-container { padding: 10px; }
  .remote-ai-container { height: 50vh; max-height: 400px; }
  .controls-container { padding: 15px; gap: 12px; }
  .control-btn { padding: 14px 16px; min-width: 70px; }
  .btn-icon { font-size: 20px !important; }
  .btn-text { font-size: 11px !important; }
  .call-info { margin-bottom: 10px; padding: 10px 20px; }
  .ai-character { width: 130px; height: 130px; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background: transparent !important; box-shadow: none !important; border: none !important; }
}
@media (min-width: 769px) { .new-video-call-container { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; margin: 0 auto !important; padding: 0 !important; } .video-stream-container { width: 100% !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; margin: 0 auto !important; padding: 0 !important; } .remote-ai-container { width: 60% !important; display: flex !important; align-items: center !important; justify-content: center !important; margin: 0 auto !important; } .call-info { margin: 0 auto 30px !important; } .new-video-call-container, .video-stream-container { max-width: 1200px !important; } .new-video-call-container > *, .video-stream-container > * { max-width: 100% !important; flex-shrink: 0 !important; } }

@media (min-width: 769px) {
  .local-video { width: 22%; height: 26%; }
}
 
@media (max-width: 480px) { .remote-ai-container { height: 45vh; max-height: 350px } }
@media (max-width: 480px) { .ai-character { width: 110px; height: 110px } }

@media (max-height: 700px) {
  .remote-ai-container { height: 50vh; max-height: 350px; }
  .controls-container { padding: 10px; }
}

@media (min-height: 1000px) {
  .remote-ai-container { height: 50vh; max-height: 600px; }
}

@media (max-width: 360px) { .local-video-preview { width: 160px; height: 106px } }
@media (orientation: landscape) and (max-height: 500px) { .bottom-controls { bottom: 12px } }
@media (hover: none) { .hangup-btn:hover { transform: none } }

@media (hover: none) and (pointer: coarse) { .embedded-btn { min-width: 44px; min-height: 44px; width: 44px; height: 44px; } .embedded-icon { width: 24px; height: 24px; } .disabled-line { width: 30px; } .local-video-preview { width: 180px; height: 135px; } .embedded-controls { left: 10px; bottom: 10px; gap: 10px; } .hangup-btn { min-width: 70px; min-height: 70px; } .embedded-btn:hover { background: rgba(0, 0, 0, 0.3); } .embedded-btn:active { background: rgba(0, 0, 0, 0.5); transform: scale(0.95); } .hangup-btn:hover { transform: none; background: #ff3b30; } .hangup-btn:active { background: #ff5e54; transform: scale(0.95); } }
@media (hover: none) and (pointer: coarse) and (min-width: 768px) { .embedded-btn { min-width: 40px; min-height: 40px; width: 40px; height: 40px; } .embedded-icon { width: 22px; height: 22px; } .local-video-preview { width: 220px; height: 165px; } .embedded-controls { left: 12px; bottom: 12px; gap: 12px; } }

.embedded-btn:focus-visible { outline: 2px solid #4a90e2; outline-offset: 2px; box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3); }
.hangup-btn:focus-visible { outline: 3px solid #4a90e2; outline-offset: 3px; box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3); }
.ai-character:hover { transform: translate(-50%, -50%) scale(1.05); box-shadow: none !important; background: transparent !important; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

@supports not ((backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0))) {
  .ai-character { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background: transparent !important; box-shadow: none !important; border: none !important; }
}

@media (prefers-contrast: high) { .embedded-btn { background: rgba(0, 0, 0, 0.6); border: 1px solid #fff; } .embedded-btn[data-state="off"] .embedded-icon { fill: #ccc; } .disabled-line { background-color: #fff; } .local-video-preview { border-color: #fff; border-width: 2px; } .hangup-btn { border: 2px solid #fff; } }

@media (prefers-reduced-motion: reduce) { .embedded-btn, .hangup-btn, .local-video-preview, #localVideo { transition: none !important; } .embedded-btn:active, .hangup-btn:active { transform: none !important; } * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }

@media (prefers-color-scheme: dark) { .local-video-preview { border-color: rgba(255, 255, 255, 0.7); } .embedded-btn { background: rgba(255, 255, 255, 0.15); } .embedded-btn:hover { background: rgba(255, 255, 255, 0.25); } .embedded-btn:active { background: rgba(255, 255, 255, 0.35); } }
@media (prefers-color-scheme: light) { .video-call-container { background: #f5f5f7; } .local-video-preview { border-color: #F0F0F0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); } .embedded-btn { background: rgba(0, 0, 0, 0.2); } .embedded-btn:hover { background: rgba(0, 0, 0, 0.3); } .embedded-btn:active { background: rgba(0, 0, 0, 0.4); } .embedded-icon { fill: #fff; } .embedded-btn[data-state="off"] .embedded-icon { fill: rgba(255, 255, 255, 0.5); } .disabled-line { background-color: rgba(255, 255, 255, 0.8); } .hangup-btn { box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3); } }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@keyframes buttonPulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
.embedded-btn[data-state="on"]:active, .hangup-btn:active { animation: buttonPulse 0.2s ease; }

.embedded-btn.loading { position: relative; overflow: hidden; }
.embedded-btn.loading::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent); animation: loadingShimmer 1.5s infinite; }
@keyframes loadingShimmer { 100% { left: 200%; } }

.embedded-btn.error { background: rgba(255, 59, 48, 0.3); animation: errorPulse 1.5s infinite; }
@keyframes errorPulse { 0%, 100% { background-color: rgba(255, 59, 48, 0.3); } 50% { background-color: rgba(255, 59, 48, 0.5); } }

.connection-status { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; border-radius: 50%; background: #4cd964; z-index: 11; }
.connection-status.connecting { background: #ffcc00; animation: connectionPulse 1.5s infinite; }
.connection-status.disconnected { background: #ff3b30; }
@keyframes connectionPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.video-error { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 24px; z-index: 1000; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); max-width: 400px; width: 90%; }
.error-content { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.error-icon { width: 40px; height: 40px; background: #ff3b30; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
.error-text { font-size: 16px; color: #333; text-align: center; line-height: 1.4; }
.error-retry { background: #007aff; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background 0.2s ease; }
.error-retry:hover { background: #0056cc; }
@media (prefers-color-scheme: dark) { .video-error { background: rgba(28, 28, 30, 0.95); } .error-text { color: white; } }

.device-notification { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(20px); background: rgba(0, 0, 0, 0.8); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 1000; opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease; max-width: 90%; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); pointer-events: none; }
.device-notification.show { transform: translateX(-50%) translateY(0); opacity: 1; }
@media (max-width: 480px) { .device-notification { bottom: 80px; padding: 10px 16px; font-size: 13px; } }
@media (prefers-color-scheme: dark) { .device-notification { background: rgba(255, 255, 255, 0.9); color: #333; } }
.network-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-20px); padding: 12px 24px; background: rgba(0, 0, 0, 0.8); color: white; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 1000; opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease; max-width: 90%; text-align: center; pointer-events: none; }
.network-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
@media (max-width: 480px) { .network-toast { top: 10px; padding: 10px 16px; font-size: 13px; } }
.reconnecting-indicator { position: fixed; top: 20px; right: 20px; background: rgba(255, 149, 0, 0.9); color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 500; z-index: 1000; animation: reconnectPulse 1s infinite; }
@keyframes reconnectPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.page-hidden-notice { position: fixed; top: 20px; right: 20px; background: rgba(255, 149, 0, 0.9); color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 500; z-index: 1000; display: none; }
@media (max-width: 480px) { .page-hidden-notice { top: 10px; right: 10px; padding: 6px 12px; font-size: 11px; } }
 .video-call-container > .call-duration { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.7); color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-family: monospace; z-index: 100; display: none; }
 .video-call-container > .call-duration.show { display: block; }
 @media (max-width: 480px) { .video-call-container > .call-duration { top: 10px; padding: 6px 12px; font-size: 12px; } }
 .network-status-indicator { position: fixed; bottom: 80px; right: 20px; width: 12px; height: 12px; border-radius: 50%; z-index: 100; border: 2px solid rgba(255, 255, 255, 0.3); transition: all 0.3s ease; }
 .network-status-indicator.online { background: #34c759; box-shadow: 0 0 8px rgba(52, 199, 89, 0.5); }
 .network-status-indicator.offline { background: #ff9500; animation: networkPulse 2s infinite; }
 @keyframes networkPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
 @media (max-width: 480px) { .network-status-indicator { bottom: 60px; right: 15px; width: 10px; height: 10px; } }
.quality-indicator { position: fixed; bottom: 80px; right: 40px; width: 12px; height: 12px; border-radius: 50%; z-index: 100; border: 2px solid rgba(255, 255, 255, 0.3); transition: all 0.3s ease; }
.quality-indicator.good { background: #4cd964; box-shadow: 0 0 8px rgba(76, 217, 100, 0.5); }
.quality-indicator.fair { background: #ffcc00; box-shadow: 0 0 8px rgba(255, 204, 0, 0.5); }
.quality-indicator.poor { background: #ff3b30; animation: qualityPulse 2s infinite; }
@keyframes qualityPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@media (max-width: 480px) { .quality-indicator { bottom: 60px; right: 30px; width: 10px; height: 10px; } }
.simple-summary { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 12px; border-radius: 8px; font-size: 12px; line-height: 1.4; z-index: 100; max-width: 90%; white-space: pre-line; }
.device-notification.success { background: rgba(52, 199, 89, 0.9); }
.device-notification.error { background: rgba(255, 59, 48, 0.9); }

.local-video-preview, .embedded-btn, .hangup-btn { transform: translateZ(0); backface-visibility: hidden; -webkit-font-smoothing: antialiased; }
#localVideo, #remoteVideo { transform: translateZ(0); -webkit-transform: translateZ(0); }
#remoteVideo { width: 100%; height: 100%; object-fit: cover; border: none !important; border-radius: 12px; box-shadow: none !important; }
@keyframes float { 0%, 100% { transform: translate(-50%, -50%) translateY(0); } 50% { transform: translate(-50%, -50%) translateY(-20px); } }
@keyframes float-mobile { 0%, 100% { transform: translate(-50%, -50%) translateY(0); } 50% { transform: translate(-50%, -50%) translateY(-10px); } }
@media (max-width: 768px) { .ai-character { animation: float-mobile 10s ease-in-out infinite } }
video { -webkit-transform: translateZ(0); -webkit-backface-visibility: hidden; -webkit-perspective: 1000; }
.local-video-preview { contain: layout paint style; }
.embedded-controls { contain: content; }
.embedded-btn, .embedded-icon, .disabled-line, .hangup-btn, #localVideo { will-change: transform, opacity, background-color; }
.video-call-container { -webkit-overflow-scrolling: touch; overscroll-behavior: none; }
.video-call-container, .embedded-btn, .hangup-btn { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
.embedded-btn, .hangup-btn { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.video-call-container { text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
video { image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; }

.embedded-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.embedded-btn:disabled:hover { background: rgba(0, 0, 0, 0.3) !important; transform: none !important; }
.debug-border { animation: pulse-border 2s infinite; box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.5); }
@keyframes pulse-border { 0%, 100% { box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.5) } 50% { box-shadow: 0 0 0 4px rgba(0, 255, 0, 0.5) } }
</style>
 
