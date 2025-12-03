<template>
  <div class="voice-call-overlay call-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
    <div :class="['w-80 rounded-2xl p-6 text-center', isDarkMode ? 'bg-gray-800' : 'bg-white/90']">
      <img 
        :src="starAvatar" 
        alt="启明星" 
        class="w-20 h-20 rounded-full mx-auto mb-4 object-cover ring-4 ring-primary"
      />
      <h3 :class="['text-lg font-bold mb-2', isDarkMode ? 'text-white' : 'text-gray-800']">
        正在与启明星通话
      </h3>
      <p :class="['mb-4', isDarkMode ? 'text-gray-300' : 'text-gray-600']">
        通话时间: {{ formatDuration(callDuration) }}
      </p>
      <div class="flex gap-4 justify-center">
        <button
          @click="$emit('toggle-mute')"
          :class="['p-4 rounded-full transition-all hover:scale-110', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
        >
          <svg v-if="isMuted" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67 .52-1.42 .93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        </button>
        <button
          @click="$emit('end-call')"
          class="p-4 rounded-full bg-red-500 text-white transition-all hover:scale-110"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9c-1.6 0-3.15 .25-4.6 .72v3.1c0 .39-.23 .74-.56 .9-.98 .49-1.87 1.12-2.66 1.85-.18 .18-.43 .28-.7 .28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28 .11-.53 .29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18 .18 .29 .43 .29 .71 0 .28-.11 .53-.29 .71l-2.48 2.48c-.18 .18-.43 .29-.71 .29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
defineProps({
  starAvatar: String,
  callDuration: Number,
  isMuted: Boolean,
  isDarkMode: Boolean
})

defineEmits(['toggle-mute', 'end-call'])

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

let borderObserver = null
const removeCharacterBorders = () => {
  const selectors = [
    '[class*="character"]',
    '[class*="avatar"]',
    '[class*="virtual"]',
    '.model-container',
    '.threejs-canvas'
  ]
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.border = 'none'
      el.style.outline = 'none'
      el.style.boxShadow = 'none'
      el.style.background = 'transparent'
      const medias = el.querySelectorAll('img, video, canvas')
      medias.forEach(m => {
        m.style.border = 'none'
        m.style.borderRadius = '0'
        m.style.objectFit = 'cover'
        m.style.background = 'transparent'
      })
    })
  })
}
onMounted(() => {
  nextTick(() => {
    removeCharacterBorders()
    borderObserver = new MutationObserver(() => { removeCharacterBorders() })
    borderObserver.observe(document.body, { childList: true, subtree: true })
  })
})
onBeforeUnmount(() => { if (borderObserver) { borderObserver.disconnect(); borderObserver = null } })
</script>

<style scoped>
.voice-call-overlay .flex.gap-4.justify-center > button { display: flex !important; justify-content: center !important; align-items: center !important; position: relative !important; }
.voice-call-overlay .flex.gap-4.justify-center > button > svg { position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; margin: 0 !important; padding: 0 !important; }
.call-overlay, .call-interface { border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
.virtual-character-container, .avatar-display-area, .character-showcase { border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; }
.virtual-character-image, .character-avatar, [class*="avatar"] video, [class*="character"] img { border: none !important; border-radius: 0 !important; box-shadow: none !important; background: transparent !important; object-fit: cover !important; }
.character-wrapper, .avatar-wrapper { padding: 0 !important; margin: 0 !important; overflow: hidden !important; background: transparent !important; }
.threejs-container, .webgl-canvas, .model-renderer { border: none !important; background: transparent !important; outline: none !important; }
@media (max-width: 768px) { .virtual-character-container { border: none !important; } }
</style>
