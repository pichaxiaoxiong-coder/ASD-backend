<template>
  <div 
    :class="['dialog-container', 'main-content', 'main-content-area', 'growth-companion-page', 'min-h-screen transition-all duration-1000']"
    class="relative overflow-hidden z-[2000]"
    :style="mainContentStyle"
  >
    <div class="side-background left" aria-hidden="true"></div>
    <div class="side-background right" aria-hidden="true"></div>
    <BackgroundDecorations :is-dark-mode="isDarkMode" />

    <div class="side-background" aria-hidden="true"></div>
    <header class="fixed top-0 left-0 right-0 w-full z-[1000] px-4 bg-[#f8f9fa] shadow-sm">
      <div class="header-content flex justify-between items-center h-[60px] max-w-[1200px] mx-auto gap-0">
        <div class="back-button-area flex items-center gap-2">
          <button 
            @click="goBack"
            class="back-button p-2 rounded-full hover:bg-white/20 transition-all hover:scale-105"
            aria-label="返回"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" :fill="isDarkMode ? '#fff' : '#333'">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
        </div>
        <div class="logo-area flex items-center ml-2 gap-1">
          <div 
            @dblclick="handleAvatarDoubleClick"
            class="relative cursor-pointer"
          >
            <img 
              :src="starAvatar"
              alt="启明星" 
              class="logo-icon w-6 h-6 rounded-full object-cover transition-transform hover:scale-110"
              @error="handleImageError"
            />
            <div v-if="showStars" class="absolute inset-0 pointer-events-none">
              <div 
                v-for="i in 6" 
                :key="i"
                class="absolute text-yellow-400 animate-bounce-in"
                :style="getStarPosition(i)"
              >
                ✨
              </div>
            </div>
          </div>
          <div>
            <h1 :class="['brand-text text-base font-semibold', isDarkMode ? 'text-white' : 'text-gray-800']">启明星</h1>
            <p :class="['text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600']">成长陪伴AI助手</p>
          </div>
        </div>
        <div class="avatar-area flex gap-2 items-center">
          <button
            @click="openCallMenu($event)"
            :class="[
              'rounded-full transition-all hover:scale-105 call-button',
              isCalling ? 'bg-red-500 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            ]"
            :style="{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }"
          >
            <svg v-if="isCalling" class="call-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" :style="{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }"><path d="M19 12l-7-5v10z"/></svg>
            <svg v-else class="call-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" :style="{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.61 20 4 13.39 4 5.5a1 1 0 011-1H8.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.43 2.3z"/></svg>
          </button>
          <div :class="['px-3 py-1 rounded-full text-xs flex items-center gap-2 online-indicator', isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700']">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            在线
          </div>
        </div>
      </div>
    </header>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 pb-0" style="max-height: calc(100vh - 300px);">
      <MessageBubble 
        v-for="message in messages" 
        :key="message.id"
        :message="message"
        :is-dark-mode="isDarkMode"
        :star-avatar="starAvatar"
      />
      <div v-if="isTyping" class="flex gap-3 justify-start">
        <img :src="starAvatar" alt="启明星" class="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
        <div :class="isDarkMode ? 'rounded-2xl px-4 py-3 shadow-sm bg-gray-700' : 'rounded-2xl px-4 py-3 shadow-sm bg-white/80'">
          <div class="flex gap-1">
            <div :class="['w-2 h-2 rounded-full', isDarkMode ? 'bg-gray-400' : 'bg-gray-500']" style="animation: typing-dots 1.4s infinite"></div>
            <div :class="['w-2 h-2 rounded-full', isDarkMode ? 'bg-gray-400' : 'bg-gray-500']" style="animation: typing-dots 1.4s infinite 0.2s"></div>
            <div :class="['w-2 h-2 rounded-full', isDarkMode ? 'bg-gray-400' : 'bg-gray-500']" style="animation: typing-dots 1.4s infinite 0.4s"></div>
          </div>
        </div>
      </div>
    </div>

    <VoiceCallOverlay 
      v-if="isCalling" 
      :star-avatar="starAvatar"
      :call-duration="callDuration"
      :is-muted="isMuted"
      :is-dark-mode="isDarkMode"
      @toggle-mute="isMuted = !isMuted"
      @end-call="toggleVoiceCall"
    />

    <VoiceRecordingOverlay
      v-if="showVoiceOverlay"
      :recording-time="recordingTime"
      :recording-volume="recordingVolume"
      :is-canceling="isCanceling"
    />

    <Transition name="fade">
      <div 
        v-if="easterEggMessage"
        class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce-in"
      >
        {{ easterEggMessage }}
      </div>
    </Transition>

    <Transition name="call">
      <div v-if="showCallMenu" class="fixed inset-0 z-[999]" @click.self="closeCallMenu" aria-hidden="true">
        <div class="fixed bg-black/30 inset-0 call-menu-backdrop" />
        <div class="call-menu" :style="callMenuStyle" role="dialog" aria-modal="true" @click.stop>
          <button class="call-close" @click="closeCallMenu" aria-label="关闭"></button>
          <div class="call-options">
            <button class="call-option" @click="chooseVoice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1677FF"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.61 20 4 13.39 4 5.5a1 1 0 011-1H8.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.43 2.3z"/></svg>
              <span class="opt-text">语音通话</span>
            </button>
            <button class="call-option" @click="chooseVideo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1677FF"><path d="M17 10.5V7a2 2 0 00-2-2H5A2 2 0 003 7v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z"/></svg>
              <span class="opt-text">视频通话</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 权限请求弹窗 -->
    <Transition name="call">
      <div v-if="showPermDialog" class="fixed inset-0 z-[1001]" @click.self="closePermDialog">
        <div class="fixed bg-black/30 inset-0" />
        <div class="perm-dialog" role="dialog" aria-modal="true">
          <p class="perm-text">启明星需要获取麦克风和摄像头权限，才能进行视频通话哦</p>
          <div class="perm-actions">
            <button class="btn perm-cancel ripple" @click="closePermDialog">取消</button>
            <button class="btn perm-allow ripple" @click="confirmPerm">允许</button>
          </div>
          <p v-if="permError" class="perm-error">无法进行视频通话，请开启权限</p>
        </div>
      </div>
    </Transition>

    <div
      :class="[
        'chat-dialog-container',
        isDialogExpanded ? 'expanded' : 'collapsed',
        'fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm border-t',
        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
      ]"
      :style="dialogPositionStyle"
    >
      <button
        class="toggle-arrow-btn"
        @click="toggleDialog"
        :aria-expanded="isDialogExpanded"
        aria-label="展开或收起快捷短语"
      >
        <svg :class="['arrow-icon', !isDialogExpanded ? 'rot' : '']" viewBox="0 0 12 12" role="img" aria-hidden="true">
          <path d="M2 7.5 L6 4 L10 7.5 Q9.6 7.8 9.2 7.8 L2.8 7.8 Q2.4 7.8 2 7.5 Z"/>
        </svg>
      </button>
      <div class="quick-replies flex flex-wrap gap-2 mb-3 overflow-x-auto pb-2"
           :style="{ '--qr-pill-border-color': isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)', '--qr-container-border-color': isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', '--qr-container-border-width': '1.2px', '--qr-bg': isDarkMode ? 'rgba(20,27,45,0.65)' : 'rgba(255,255,255,0.7)' }">
        <button
          v-for="(reply, index) in quickReplies"
          :key="index"
          @click="inputMessage = reply"
          :class="isDarkMode 
            ? 'quick-pill quick-pill-dark text-xs px-3 py-2 rounded-full whitespace-nowrap transition-all hover:scale-105 bg-[#2f3a56] hover:bg-[#253149] text-[#F5F7FA]' 
            : 'quick-pill quick-pill-light text-xs px-3 py-2 rounded-full whitespace-nowrap transition-all hover:scale-105 bg-[#F4F5F7] hover:bg-white text-[#333]'"
        >
          {{ reply }}
        </button>
      </div>

      <div v-if="selectedImage" :class="['mb-3 p-3 rounded-lg', isDarkMode ? 'bg-gray-700' : 'bg-white/50']">
        <div class="flex items-center gap-3">
          <img :src="selectedImage" alt="预览" class="w-16 h-16 object-cover rounded-lg" />
          <div class="flex-1">
            <p :class="['text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600']">已选择图片</p>
            <button @click="selectedImage = null" class="text-sm text-red-500 hover:text-red-700">移除</button>
          </div>
        </div>
      </div>

      <div class="flex justify-center mb-3">
        <div :class="isDarkMode ? 'rounded-full p-1 flex gap-2 bg-gray-700/30' : 'rounded-full p-1 flex gap-2 bg-gray-100'">
          <button
            @click="showVoiceInput = false"
            :aria-pressed="!showVoiceInput"
            :class="isDarkMode ? (!showVoiceInput ? 'mode-toggle-btn dark active' : 'mode-toggle-btn dark') : (!showVoiceInput ? 'mode-toggle-btn light active' : 'mode-toggle-btn light')"
          >
            文字
          </button>
          <button
            @click="showVoiceInput = true"
            :aria-pressed="showVoiceInput"
            :class="isDarkMode ? (showVoiceInput ? 'mode-toggle-btn dark active' : 'mode-toggle-btn dark') : (showVoiceInput ? 'mode-toggle-btn light active' : 'mode-toggle-btn light')"
          >
            语音
          </button>
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <div class="relative">
          <button
            @click="showMoreOptions = !showMoreOptions"
            class="rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-105"
            aria-label="更多"
          >
            ⋯
          </button>
          <div 
            v-if="showMoreOptions"
            :class="isDarkMode 
              ? 'absolute bottom-14 left-0 rounded-lg shadow-lg border p-2 space-y-1 z-10 bg-gray-800 border-gray-700' 
              : 'absolute bottom-14 left-0 rounded-lg shadow-lg border p-2 space-y-1 z-10 bg-white border-gray-200'"
          >
            <button @click="triggerImageUpload" :class="['w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-sm', isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'text-gray-700']">图片</button>
            <button @click="showMoreOptions = false" :class="['w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-sm', isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'text-gray-700']">拍照</button>
          </div>
        </div>

        <button
          v-if="showVoiceInput"
          @mousedown="startVoiceRecording"
          @mouseup="stopVoiceRecording"
          @touchstart="startVoiceRecording"
          @touchend="stopVoiceRecording"
          class="flex-1 h-12 rounded-full bg-gradient-to-r from-primary to-cyan-600 text-white font-medium transition-all hover:scale-105 active:scale-95"
        >
          <div class="flex items-center justify-center gap-2">
            <span class="text-sm">按住说话</span>
          </div>
        </button>

        <div v-else class="flex-1 relative">
          <textarea
            v-model="inputMessage"
            @keypress.enter.exact="handleSendMessage"
            placeholder="输入消息..."
            aria-label="输入消息"
            :class="isDarkMode ? 'chat-input dark' : 'chat-input light'"
            rows="1"
          />
        </div>

        <button
          @click="handleSendMessage"
          :disabled="(!inputMessage.trim() && !selectedImage) || isTyping"
          class="rounded-full w-12 h-12 bg-gradient-to-r from-accent-orange to-yellow-500 hover:from-yellow-600 hover:to-orange-600 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➤
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleImageUpload"
        class="hidden"
      />
    </div>

    

    

    

    <div class="clouds-layer" aria-hidden="true">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
      <div class="cloud cloud-4"></div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, type CSSProperties } from 'vue'
import { useRouter } from 'vue-router'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import MessageBubble from '@/components/MessageBubble.vue'
import VoiceCallOverlay from '@/components/VoiceCallOverlay.vue'
import VoiceRecordingOverlay from '@/components/VoiceRecordingOverlay.vue'

const starAvatar = '/images/star-mascot.png'

const isDarkMode = ref(false)
const messages = ref([
  { id: '1', type: 'ai', content: '你好！我是启明星🌟 你的成长陪伴小助手，今天想聊什么呢？', timestamp: new Date(), mediaType: 'text' }
])
const inputMessage = ref('')
const isTyping = ref(false)
const selectedImage = ref<string | null>(null)
const showMoreOptions = ref(false)
const showVoiceInput = ref(false)
const isCalling = ref(false)
const isMuted = ref(false)
const callDuration = ref(0)
const showVoiceOverlay = ref(false)
const recordingTime = ref(0)
const recordingVolume = ref(0)
const isCanceling = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const dockSpacing = 16
const collapsedPeekHeight = 56
const showStars = ref(false)
const easterEggMessage = ref('')
const isDialogExpanded = ref(true)
const moonButtonSize = 56
const moonButtonPosition = ref({ top: 0, left: 0 })
const moonDragOffset = ref({ x: 0, y: 0 })
const isDraggingMoon = ref(false)
const hasDraggedMoon = ref(false)
const router = useRouter()

const toggleDialog = () => { isDialogExpanded.value = !isDialogExpanded.value }

const mainContentStyle = computed(() => ({ paddingBottom: `${96}px`, marginTop: `${60}px` }))
const dialogPositionStyle = computed(() => ({ bottom: `${dockSpacing}px`, transform: isDialogExpanded.value ? 'translateY(0)' : `translateY(calc(100% - ${collapsedPeekHeight}px))` }))

const clampMoonPosition = (top: number, left: number): { top: number; left: number } => {
  if (typeof window === 'undefined') return { top, left }
  const margin = 16
  const maxTop = window.innerHeight - moonButtonSize - margin
  const maxLeft = window.innerWidth - moonButtonSize - margin
  return { top: Math.min(Math.max(margin, top), Math.max(margin, maxTop)), left: Math.min(Math.max(margin, left), Math.max(margin, maxLeft)) }
}
const initializeMoonPosition = () => {
  if (typeof window === 'undefined') { moonButtonPosition.value = { top: 200, left: 20 }; return }
  const initialTop = window.innerHeight / 2 - moonButtonSize / 2
  const initialLeft = window.innerWidth - moonButtonSize - 16
  moonButtonPosition.value = clampMoonPosition(initialTop, initialLeft)
}
const getClientPoint = (event: MouseEvent | TouchEvent) => (('touches' in event && event.touches?.length) ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY })
const handleMoonDrag = (event: MouseEvent | TouchEvent) => { if (!isDraggingMoon.value) return; event.preventDefault(); const { x, y } = getClientPoint(event); const newLeft = x - moonDragOffset.value.x; const newTop = y - moonDragOffset.value.y; moonButtonPosition.value = clampMoonPosition(newTop, newLeft); hasDraggedMoon.value = true }
const stopMoonDrag = () => { if (!isDraggingMoon.value) return; isDraggingMoon.value = false; window.removeEventListener('mousemove', handleMoonDrag); window.removeEventListener('touchmove', handleMoonDrag); window.removeEventListener('mouseup', stopMoonDrag); window.removeEventListener('touchend', stopMoonDrag) }
// 已移除 startMoonDrag（夜间模式切换按钮相关）
// 已移除夜间模式切换按钮
const handleResize = () => { moonButtonPosition.value = clampMoonPosition(moonButtonPosition.value.top, moonButtonPosition.value.left) }
onMounted(() => { initializeMoonPosition(); window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => { stopMoonDrag(); window.removeEventListener('resize', handleResize) })

const quickReplies = ['今天心情怎么样？','我想交朋友','帮我练习对话','讲个故事给我听','我有点紧张','今天学到了什么？']
const easterEggMessages = ['你拍了星星🌟','你好呀，今天过得怎么样？','我们来聊聊天吧！','嘿，今天有什么新鲜事吗？','我在这里等你好久了！','你的心情如何？','让我们一起探索新事物吧！','有什么可以分享的故事吗？','今天学到了什么新东西？','需要帮助吗？我在这里！','今天的天气真不错！','你有什么计划吗？','让我们开始吧！']

const goBack = () => { router.push('/dashboard/child') }
// 已移除夜间模式切换方法
const handleImageError = (e: Event) => { (e.target as HTMLImageElement).style.display = 'none' }
const getStarPosition = (index: number): Record<string, string> => ([{ top: '-10px', left: '-10px' },{ top: '-10px', right: '-10px' },{ bottom: '-10px', left: '-10px' },{ bottom: '-10px', right: '-10px' },{ top: '50%', left: '-15px', transform: 'translateY(-50%)' },{ top: '50%', right: '-15px', transform: 'translateY(-50%)' }][index] as Record<string, string>)
const handleAvatarDoubleClick = () => { showStars.value = true; const randomMessage = easterEggMessages[Math.floor(Math.random() * easterEggMessages.length)]; easterEggMessage.value = randomMessage; setTimeout(() => { showStars.value = false }, 1000); setTimeout(() => { easterEggMessage.value = '' }, 3000) }
const scrollToBottom = () => { nextTick(() => { if (messagesContainer.value) { messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight } }) }
const handleSendMessage = async () => { if (!inputMessage.value.trim() && !selectedImage.value) return; const userMessage = { id: Date.now().toString(), type: 'user', content: inputMessage.value || (selectedImage.value ? '[图片]' : ''), timestamp: new Date(), mediaType: selectedImage.value ? 'image' : 'text', mediaUrl: selectedImage.value ?? undefined }; messages.value.push(userMessage); inputMessage.value=''; selectedImage.value=null; isTyping.value=true; scrollToBottom(); setTimeout(async () => { const aiResponse = await generateAIResponse(userMessage.content, userMessage.mediaUrl); const aiMessage = { id: (Date.now()+1).toString(), type: 'ai', content: aiResponse, timestamp: new Date(), mediaType: 'text' }; messages.value.push(aiMessage); isTyping.value=false; scrollToBottom() }, 1000 + Math.random()*2000) }
const generateAIResponse = async (userInput: string, hasImage?: string | undefined): Promise<string> => {
  const responses = ['启明星理解你的感受，这确实是一个很好的问题！让我们一起来思考一下...','哇，你提到的这个想法很有趣！启明星觉得你可以尝试...','启明星为你感到骄傲！你正在学习如何更好地表达自己。','这听起来像是一个挑战，但启明星相信你有能力克服它。','你的想法很有创意！让我们继续探索这个方向...','启明星注意到你在努力思考，这很棒！','每个人都有自己的节奏，你做得很好！','你的问题让启明星想到了一个有趣的故事...','启明星感受到你的真诚，这让我很感动。','让我们一起找到解决问题的方法，好吗？']
  if (userInput.includes('开心') || userInput.includes('高兴')) return '看到你这么开心，启明星也很开心！🌟 能告诉我是什么让你这么高兴吗？'
  if (userInput.includes('难过') || userInput.includes('伤心')) return '启明星感受到你有些难过，这很正常。我在这里陪着你，想聊聊发生了什么吗？'
  if (userInput.includes('朋友') || userInput.includes('社交')) return '交朋友是一件很棒的事情！启明星想了解一些交朋友的技巧吗？'
  if (hasImage) return '启明星看到你分享了一张图片！这张图片很有趣，能告诉我你想表达什么吗？'
  return responses[Math.floor(Math.random()*responses.length)]
}
const triggerImageUpload = () => { fileInput.value?.click(); showMoreOptions.value=false }
const handleImageUpload = (event: Event) => { const file = (event.target as HTMLInputElement).files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => { selectedImage.value = reader.result as string }; reader.readAsDataURL(file) } }
const toggleVoiceCall = () => { isCalling.value = !isCalling.value; if (isCalling.value) { callDuration.value = 0; const interval = setInterval(() => { if (isCalling.value) callDuration.value++; else clearInterval(interval) }, 1000) } }
const startVoiceRecording = () => { showVoiceOverlay.value = true; recordingTime.value = 0; const interval = setInterval(() => { if (showVoiceOverlay.value) { recordingTime.value++; recordingVolume.value = Math.random()*100 } else { clearInterval(interval) } }, 1000) }
const stopVoiceRecording = () => { if (!isCanceling.value && recordingTime.value > 0) { const voiceMessage = { id: Date.now().toString(), type: 'user', content: '[语音消息]', timestamp: new Date(), mediaType: 'voice', duration: recordingTime.value }; messages.value.push(voiceMessage); setTimeout(() => { const aiMessage = { id: (Date.now()+1).toString(), type: 'ai', content: '启明星听到了你的语音消息！你的声音很清晰，想继续用语音聊天吗？', timestamp: new Date(), mediaType: 'text' }; messages.value.push(aiMessage); scrollToBottom() }, 2000) } showVoiceOverlay.value=false; recordingTime.value=0; recordingVolume.value=0; isCanceling.value=false; scrollToBottom() }

// 电话图标弹层
const showCallMenu = ref(false)
const callMenuStyle = ref<CSSProperties>({ top: '0px', left: '0px', transform: 'translateX(-50%)' })
let callMenuObserver: MutationObserver | null = null
const handleBackdropClick = (event: Event) => {
  const target = event.target as HTMLElement
  const current = event.currentTarget as HTMLElement
  if (target === current || target.classList.contains('bg-black/30')) closeCallMenu()
}
const handleGlobalClick = (event: MouseEvent) => {
  if (!showCallMenu.value) return
  const target = event.target as HTMLElement
  const isBackdrop = target.classList.contains('fixed') && target.classList.contains('inset-0')
  const isOverlay = target.classList.contains('bg-black/30')
  const isOutside = !target.closest('.call-menu')
  if (isBackdrop || isOverlay || isOutside) closeCallMenu()
}
const debugCallMenu = () => {
  console.log('=== 通话菜单调试 ===')
  console.log('showCallMenu:', showCallMenu.value)
  const backdrop = document.querySelector('.fixed.inset-0.z-50, [class*="backdrop"], [class*="overlay"]') as HTMLElement | null
  console.log('弹窗背景元素:', backdrop)
  if (backdrop) {
    console.log('弹窗背景类名:', backdrop.className)
    const getEvt = (window as any).getEventListeners
    if (typeof getEvt === 'function') console.log('点击事件监听器:', getEvt(backdrop))
    backdrop.addEventListener('click', (e) => { console.log('点击弹窗背景:', e.target, e.currentTarget) })
  }
  const callMenuElement = document.querySelector('[v-if="showCallMenu"]')
  console.log('通话菜单元素:', callMenuElement)
}
const forceFixCallMenuClick = () => {
  if (callMenuObserver) return
  callMenuObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          const el = node as HTMLElement
          if (el.nodeType === 1 && (el.classList?.contains('fixed') || el.classList?.contains('inset-0') || el.getAttribute('class')?.includes('z-50') || el.getAttribute('class')?.includes('z-[999]'))) {
            el.removeEventListener('click', handleBackdropClick)
            el.addEventListener('click', handleBackdropClick)
          }
        })
      }
    })
  })
  callMenuObserver.observe(document.body, { childList: true, subtree: true })
}
let callObserver: MutationObserver | null = null
const forceFixCallLayers = () => {
  document.querySelectorAll('.call-menu').forEach(el => {
    const h = el as HTMLElement
    h.style.zIndex = '10050'
    h.style.position = 'fixed'
    ;(h.style as any).isolation = 'isolate'
  })
  document.querySelectorAll('.voice-call-overlay, .video-call-container, .call-interface').forEach(el => {
    const h = el as HTMLElement
    h.style.zIndex = '10060'
    h.style.position = 'fixed'
    h.style.top = '0'
    h.style.left = '0'
    h.style.width = '100vw'
    h.style.height = '100vh'
    h.style.background = 'rgba(0,0,0,0.8)'
    ;(h.style as any).isolation = 'isolate'
  })
  document.querySelectorAll('video').forEach(el => {
    const v = el as HTMLVideoElement
    v.style.objectFit = 'cover'
    v.style.background = '#000'
    v.style.border = 'none'
    v.style.outline = 'none'
  })
  document.querySelectorAll('.video-container, .video-wrapper, .stream-container, .local-video, .remote-video').forEach(el => {
    const h = el as HTMLElement
    h.style.overflow = 'hidden'
    h.style.background = '#000'
    h.style.border = 'none'
    h.style.padding = '0'
    h.style.margin = '0'
  })
}
const bindCallButtonEvents = (button: HTMLElement) => {
  button.style.pointerEvents = 'auto'
  button.style.cursor = 'pointer'
  button.style.zIndex = '1001'
  button.addEventListener('click', (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    openCallMenu(evt as MouseEvent)
  })
}
const createEmergencyCallButton = (header: HTMLElement) => {
  const callButton = document.createElement('button')
  callButton.className = 'call-button flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 transition-transform fixed top-4 right-4 z-[1001]'
  callButton.innerHTML = '<svg class="call-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>'
  bindCallButtonEvents(callButton)
  header.appendChild(callButton)
}
const openCallMenu = (evt: MouseEvent) => {
  const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect()
  const top = rect.bottom + 8 + window.scrollY
  const left = rect.left + rect.width / 2 + window.scrollX
  callMenuStyle.value = { top: `${top}px`, left: `${left}px`, transform: 'translateX(-50%)' }
  if (window.innerWidth <= 768) {
    const mobileTop = rect.bottom + 10 + window.scrollY
    callMenuStyle.value = { top: `${mobileTop}px`, right: '10px', left: 'auto', transform: 'translateX(20px)' }
    console.log('手机端通话选项弹窗修复已应用')
    console.log('当前屏幕宽度:', window.innerWidth)
    const el = document.querySelector('.call-menu') as HTMLElement | null
    console.log('通话选项弹窗位置:', el?.getBoundingClientRect())
  }
  console.log('打开通话菜单')
  showCallMenu.value = true
  nextTick(() => { document.addEventListener('keydown', onEscClose); setTimeout(() => { debugCallMenu() }, 100) })
}
const closeCallMenu = () => { console.log('关闭通话菜单被调用'); showCallMenu.value = false; document.removeEventListener('keydown', onEscClose) }
const onEscClose = (e: KeyboardEvent) => { console.log('ESC按键按下', e.key); if (e.key === 'Escape' && showCallMenu.value) closeCallMenu() }
const chooseVoice = () => { closeCallMenu(); setTimeout(() => toggleVoiceCall(), 300) }
const showPermDialog = ref(false)
const permError = ref('')
const onEscClosePerm = (e: KeyboardEvent) => { if (e.key === 'Escape') closePermDialog() }
const closePermDialog = () => { showPermDialog.value = false; permError.value = ''; document.removeEventListener('keydown', onEscClosePerm) }
const chooseVideo = () => { closeCallMenu(); showPermDialog.value = true; document.addEventListener('keydown', onEscClosePerm) }
const confirmPerm = async () => {
  permError.value = ''
  try {
    try { await (navigator as any).permissions?.query?.({ name: 'camera' as any }) } catch {}
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    stream.getTracks().forEach(t => t.stop())
    showPermDialog.value = false
    setTimeout(() => router.push('/new-video-call'), 300)
  } catch {
    permError.value = '无法进行视频通话，请开启权限'
    setTimeout(() => { showPermDialog.value = false; router.push('/companion') }, 1200)
  }
}
watch(messages, () => { scrollToBottom() }, { deep: true })
onMounted(() => {
  scrollToBottom()
  setTimeout(() => {
    const callBtn = document.querySelector('.call-button') as HTMLElement | null
    const callIcon = document.querySelector('.call-icon') as HTMLElement | null
    if (callBtn && callIcon) {
      const btnRect = callBtn.getBoundingClientRect()
      const iconRect = callIcon.getBoundingClientRect()
      const centerX = btnRect.left + btnRect.width / 2
      const centerY = btnRect.top + btnRect.height / 2
      const iconCenterX = iconRect.left + iconRect.width / 2
      const iconCenterY = iconRect.top + iconRect.height / 2
      console.log('通话按钮居中检查:', {
        按钮中心: `${centerX}, ${centerY}`,
        图标中心: `${iconCenterX}, ${iconCenterY}`,
        是否居中: Math.abs(centerX - iconCenterX) < 2 && Math.abs(centerY - iconCenterY) < 2
      })
    }
  }, 1000)
  setTimeout(() => {
    console.log('=== 点击空白处关闭功能调试 ===')
    console.log('showCallMenu 状态:', showCallMenu.value)
    const modal = document.querySelector('.fixed.inset-0.z-\\[999\\]')
    console.log('弹窗元素是否存在:', !!modal)
    const getEvt = (window as any).getEventListeners
    if (modal && typeof getEvt === 'function') {
      console.log('弹窗点击事件监听器:', getEvt(modal))
    }
    const voiceButtons = document.querySelectorAll('.voice-call-overlay .flex.gap-4.justify-center > button')
    console.log('语音通话按钮数量:', voiceButtons.length)
    voiceButtons.forEach((btn, index) => {
      const icon = btn.firstElementChild as HTMLElement | null
      console.log(`语音按钮 ${index}:`, {
        按钮尺寸: `${(btn as HTMLElement).offsetWidth}x${(btn as HTMLElement).offsetHeight}`,
        图标尺寸: icon ? `${icon.offsetWidth}x${icon.offsetHeight}` : '无图标',
        图标样式: icon ? window.getComputedStyle(icon).position : '无图标'
      })
    })
    const videoButtons = document.querySelectorAll('.vc-controls .ctrl-btn')
    console.log('视频通话按钮数量:', videoButtons.length)
    videoButtons.forEach((btn, index) => {
      const icon = (btn as HTMLElement).firstElementChild as HTMLElement | null
      console.log(`视频按钮 ${index}:`, {
        按钮尺寸: `${(btn as HTMLElement).offsetWidth}x${(btn as HTMLElement).offsetHeight}`,
        图标尺寸: icon ? `${icon.offsetWidth}x${icon.offsetHeight}` : '无图标',
        图标样式: icon ? window.getComputedStyle(icon).position : '无图标'
      })
    })
  }, 2000)
  nextTick(() => {
    setTimeout(() => {
      const callButton = document.querySelector('.call-button') as HTMLElement | null
      if (!callButton) {
        const header = document.querySelector('header') as HTMLElement | null
        if (header) createEmergencyCallButton(header)
      } else {
        const cleanButton = callButton.cloneNode(true) as HTMLElement
        callButton.parentNode?.replaceChild(cleanButton, callButton)
        bindCallButtonEvents(cleanButton)
      }
    }, 500)
  })
  nextTick(() => {
    setTimeout(() => {
      const modalBackdrop = document.querySelector('.fixed.inset-0') as HTMLElement | null
      if (modalBackdrop && !modalBackdrop.hasAttribute('data-fixed')) {
        modalBackdrop.setAttribute('data-fixed', 'true')
        modalBackdrop.addEventListener('click', (e) => {
          if ((e.target as HTMLElement) === modalBackdrop) closeCallMenu()
        })
      }
      const fixButtonIcons = () => {
        document.querySelectorAll('.ctrl-btn').forEach(btn => {
          const icon = (btn as HTMLElement).firstElementChild as HTMLElement | null
          if (icon) {
            icon.style.position = 'absolute'
            icon.style.top = '50%'
            icon.style.left = '50%'
            icon.style.transform = 'translate(-50%, -50%)'
            icon.style.margin = '0'
            icon.style.padding = '0'
          }
        })
      }
      fixButtonIcons()
      const observer = new MutationObserver(fixButtonIcons)
      observer.observe(document.body, { childList: true, subtree: true })
      forceFixCallMenuClick()
    }, 1000)
  })
  nextTick(() => {
    forceFixCallLayers()
    callObserver = new MutationObserver(() => { forceFixCallLayers() })
    callObserver.observe(document.body, { childList: true, subtree: true })
  })
  document.addEventListener('click', handleGlobalClick)
})
onBeforeUnmount(() => { document.removeEventListener('click', handleGlobalClick); if (callMenuObserver) { callMenuObserver.disconnect(); callMenuObserver = null } if (callObserver) { callObserver.disconnect(); callObserver = null } })
</script>

<style scoped>
.main-content-area { background: #ffffff; position: relative; z-index: 1; }
.growth-companion-page { min-height: 100vh; position: relative; overflow: hidden; }
.growth-companion-page { background: #a3cbf8 !important; }
.side-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; pointer-events: none; }
@media (min-width: 769px) {
  .light-mode .side-background::before,
  .light-mode .side-background::after {
    content: '';
    position: fixed;
    top: 0;
    width: 15%;
    height: 100%;
    background: linear-gradient(to bottom, #7BBDFF 0%, #A6D2FF 40%, #C8E4FF 70%, #E6F3FF 100%);
    opacity: 1;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    z-index: -2;
    pointer-events: none;
    transition: all 0.3s ease;
  }
  .light-mode .side-background::before { left: 0; }
  .light-mode .side-background::after { right: 0; }
}
@media (max-width: 768px) { .side-background { display: none; } }
.clouds-layer { position: fixed; top: 0; left: 0; right: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; overflow: hidden; }
.cloud { position: absolute; background: rgba(255, 255, 255, 0.8); border-radius: 50%; filter: blur(5px); will-change: transform; animation: cloudDrift 90s linear infinite; }
@keyframes cloudDrift { 0% { transform: translateX(-20vw) translateY(0); } 25% { transform: translateX(25vw) translateY(6px); } 50% { transform: translateX(55vw) translateY(-4px); } 75% { transform: translateX(85vw) translateY(8px); } 100% { transform: translateX(120vw) translateY(0); } }
.cloud-1 { top: 15%; left: -20%; width: 140px; height: 60px; animation-duration: 95s; animation-delay: 0s; }
.cloud-2 { top: 35%; left: -30%; width: 160px; height: 70px; animation-duration: 110s; animation-delay: -10s; }
.cloud-3 { top: 25%; left: -15%; width: 120px; height: 50px; animation-duration: 85s; animation-delay: -18s; }
.cloud-4 { top: 55%; left: -25%; width: 180px; height: 80px; animation-duration: 100s; animation-delay: -26s; }
@media (max-width: 768px) { .cloud-1 { top: 12%; width: 110px; height: 48px; } .cloud-2 { top: 32%; width: 120px; height: 52px; } .cloud-3 { top: 52%; width: 100px; height: 42px; } .cloud-4 { top: 72%; width: 140px; height: 64px; } }
.dialog-container { position: relative; z-index: 2000; }
.main-content { margin-top: 0; padding-top: 24px; box-shadow: none; border: none; }
.chat-dialog-container { position: fixed; z-index: 2000; transition: transform 0.3s ease-out, bottom 0.3s ease-out; }
.chat-dialog-container.collapsed { height: 0 !important; overflow: visible; pointer-events: none; }
.chat-dialog-container.collapsed .toggle-arrow-btn { pointer-events: auto; }
.chat-dialog-container.expanded { height: auto; opacity: 1; }
.toggle-arrow-btn { position: absolute; left: 50%; transform: translateX(-50%) rotate(0deg); top: -48px; z-index: 2002; width: 40px; height: 40px; background: transparent; border: none; border-radius: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.toggle-arrow-btn { background: rgba(198,224,255,0.35); box-shadow: 0 4px 12px rgba(22,119,255,0.15); }
.toggle-arrow-btn:hover { background: rgba(198,224,255,0.6); }
.toggle-arrow-btn:hover .arrow-icon { fill: #1677FF; }
.toggle-arrow-btn:focus-visible { outline: 2px solid var(--focus-color); outline-offset: 2px; }
.arrow-icon { width: 14px; height: 14px; fill: #C6E0FF; transition: fill 0.2s ease, transform 0.3s ease; }
.arrow-icon.rot { transform: rotate(180deg); }
.quick-replies { border: var(--qr-container-border-width, 1.2px) solid var(--qr-container-border-color, rgba(0,0,0,0.1)); border-radius: 12px; background: rgba(255,255,255,0.7); box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 12px; transition: border-color .4s ease, box-shadow .4s ease, background-color .4s ease; }
.quick-replies { background: var(--qr-bg, rgba(255,255,255,0.7)); }
.quick-pill { border: 1px solid var(--qr-pill-border-color, rgba(0,0,0,0.15)); border-radius: 8px; transition: border-color .3s ease, box-shadow .3s ease; }
.quick-pill-dark { text-shadow: 0 1px 1px rgba(0,0,0,0.35); box-shadow: 0 1px 2px rgba(0,0,0,0.25); }
.quick-pill-light { box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
.moon-button { position: fixed; width: 56px; height: 56px; border-radius: 50%; cursor: grab; user-select: none; display: flex; align-items: center; justify-content: center; z-index: 1000; transition: transform 0.2s ease; }
.tab-switch-container { position: relative; z-index: 1000; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }
.call-enter-active, .call-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
.call-enter-from, .call-leave-to { opacity: 0; }
.call-menu { position: absolute; min-width: 200px; max-width: 240px; height: 80px; padding: 16px; z-index: 1000; background: linear-gradient(180deg, #E8F4FF, #F0F7FF); border-radius: 12px; box-shadow: 0 2px 6px rgba(22,119,255,0.1); }
.call-close { position: absolute; top: 8px; right: 8px; width: 12px; height: 12px; border-radius: 2px; background: transparent; }
.call-options { display: flex; justify-content: space-between; align-items: center; height: 100%; }
.call-option { display: flex; align-items: center; gap: 8px; background: transparent; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; transition: all .2s ease; }
.call-option:hover { background-color: #D6EFFF; transform: scale(0.98); }
.opt-text { font-size: 14px; color: #333; font-weight: 500; }
.call-button { display: flex !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; cursor: pointer !important; z-index: 1001 !important; }
/* 层级与悬浮效果优化 */
.call-menu { z-index: 10000 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important; border: 1px solid rgba(255,255,255,0.2) !important; backdrop-filter: blur(20px) !important; margin-top: 10px !important; }
.call-menu * { pointer-events: auto !important; }
.call-menu-backdrop { z-index: 9999 !important; background: rgba(0,0,0,0.3) !important; }
@media (max-width: 768px) { .call-menu { transform: translateX(20px) !important; right: 10px !important; left: auto !important; } .call-menu::before { right: 15px !important; left: auto !important; } .call-options { white-space: nowrap; min-width: max-content; } }
@media (max-width: 480px) { .call-menu { transform: translateX(30px) !important; right: 5px !important; } }
.perm-dialog { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; max-width: 90vw; background: linear-gradient(180deg, rgba(232,244,255,.95), rgba(240,247,255,.95)); border-radius: 12px; padding: 16px; box-shadow: 0 4px 12px rgba(22,119,255,0.1); }
.perm-text { font-size: 14px; color: #333; text-align: center; }
.perm-actions { margin-top: 12px; display: flex; justify-content: center; gap: 12px; }
.perm-allow { background: #E8F4FF; color: #1677FF }
.perm-cancel { background: #f5f5f5; color: #333 }
.perm-error { margin-top: 8px; text-align: center; color: #FA5151; font-size: 12px }
.perm-dialog .perm-cancel,
.perm-dialog .perm-allow { border: 1px solid #d0d0d0 !important; border-radius: 8px !important; color: #333333 !important; }
.perm-dialog button { border: 1px solid #d0d0d0 !important; border-radius: 8px !important; color: #333333 !important; }
.perm-dialog .perm-cancel { background-color: #ffffff !important; }
.perm-dialog .perm-allow { background-color: #ffffff !important; }
.perm-dialog button { background-color: #ffffff !important; }
.permission-dialog .cancel-button,
.permission-dialog .allow-button,
.permission-dialog .confirm-button { border: 1px solid #d0d0d0 !important; border-radius: 8px !important; color: #333333 !important; }
.permission-dialog button:first-child,
.permission-dialog button:last-child { border: 1px solid #d0d0d0 !important; border-radius: 8px !important; color: #333333 !important; }
/* 允许/确认按钮白色背景 */
.perm-dialog .perm-allow { background-color: #ffffff !important; }
.permission-dialog .allow-button,
.permission-dialog .confirm-button { background-color: #ffffff !important; }
.permission-dialog button { background-color: #ffffff !important; }
.permission-dialog button:last-child { background-color: #ffffff !important; }
:deep(.call-menu) { z-index: 10050 !important; position: fixed !important; isolation: isolate !important; box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; border-radius: 12px !important; backdrop-filter: blur(20px) !important; transform: translateZ(0) !important; }
:deep(.voice-call-overlay), :deep(.video-call-container), :deep(.call-interface) { z-index: 10060 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.8) !important; isolation: isolate !important; }
:deep(.voice-call-overlay .star-character),
:deep(.voice-call-overlay .character-avatar),
:deep(.voice-call-overlay [class*="star"]),
:deep(.voice-call-overlay [class*="character"]),
:deep(.voice-call-overlay [class*="avatar"]) { border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; }
:deep(.voice-call-overlay img),
:deep(.voice-call-overlay video) { border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; object-fit: cover !important; }
</style>
.mode-toggle-btn { border-radius: 8px; padding: 10px 16px; font-size: 14px; min-height: 40px; transition: background-color .3s ease, color .3s ease, border-color .3s ease, box-shadow .3s ease; }
.mode-toggle-btn.light { color:#333333; background:#F5F5F5; border:1px solid #E0E0E0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.mode-toggle-btn.light:hover { filter: brightness(0.98); }
.mode-toggle-btn.light.active { background:#EAEAEA; border-color:#D0D0D0; }
.mode-toggle-btn.dark { color:#FFFFFF; background:#333333; border:1px solid #404040; box-shadow: 0 2px 4px rgba(255,255,255,0.1); }
.mode-toggle-btn.dark:hover { opacity:.95; }
.mode-toggle-btn.dark.active { background:#222222; border-color:#3A3A3A; }

.chat-input { width: 100%; min-height: 48px; max-height: 128px; resize: none; border-radius: 12px; padding: 12px 20px; line-height: 1.5; transition: padding .2s ease, border-color .2s ease, background-color .2s ease, box-shadow .2s ease; }
.chat-input.light { background: #FFFFFF; color: #333333; border: 1px solid #E0E0E0; }
.chat-input.dark { background: rgba(255,255,255,0.1); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2); }
.chat-input::placeholder { color: #999999; }
.chat-input:focus { outline: none; border-color: var(--focus-color); box-shadow: 0 2px 6px color-mix(in oklab, var(--focus-color) 12%, transparent); }
@media (max-width: 768px) { .chat-input { padding-left: 12px; padding-right: 12px; } }
/* 垂直微动不规则云朵形状与动画 */

/* 呼叫按钮与图标居中优化 */
.call-button { display: flex !important; justify-content: center !important; align-items: center !important; width: 40px; height: 40px; border-radius: 50%; position: relative; }
.call-button .call-icon { position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; width: 20px; height: 20px; }
.call-icon svg { width: 100%; height: 100%; }

/* 在线指示器对齐优化 */
.online-indicator { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border-radius: 9999px; }
.dialog-container { min-height: 100vh; height: calc(100vh - 60px) !important; display: flex; flex-direction: column; }
:deep(.tab-nav-container), :deep(.app-bottom-nav), :deep(.bottom-nav) { display: none !important; }
.header-content { gap: 0; }
.logo-area { margin-left: 8px; display: flex; align-items: center; gap: 6px; }
.logo-icon { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1)); border: none; }
.brand-text { font-size: 16px; font-weight: 600; margin-left: 0; }
@media (max-width: 768px) { .logo-area { margin-left: 6px; gap: 4px; } .logo-icon { width: 20px; height: 20px; } .brand-text { font-size: 14px; } }
@media (max-width: 768px) { .dialog-container { height: calc(100vh - 56px) !important; } }
