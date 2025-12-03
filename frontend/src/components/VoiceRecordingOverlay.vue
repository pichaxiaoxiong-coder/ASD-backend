<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
    <div :class="['rounded-2xl p-8 mx-4 max-w-sm w-full transition-all duration-300', isCanceling ? 'transform -translate-y-4' : '', 'bg-white']">
      <div class="text-center">
        <div class="relative w-32 h-32 mx-auto mb-6">
          <div :class="['absolute inset-0 rounded-full border-4 animate-pulse', isCanceling ? 'border-orange-500' : 'border-red-500']"></div>
          <div 
            :class="['absolute inset-0 rounded-full flex items-center justify-center', isCanceling ? 'bg-orange-500' : 'bg-red-500']"
            :style="{ transform: `scale(${1 + recordingVolume / 200})`, transition: 'transform 0.1s ease-out' }"
          >
            <svg v-if="isCanceling" width="48" height="48" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </div>
          <div v-if="!isCanceling" class="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse-ring"></div>
          <div v-if="!isCanceling" class="absolute inset-0 rounded-full border-2 border-red-300 animate-pulse-ring" style="animation-delay: 0.5s"></div>
        </div>
        <h3 :class="['text-lg font-bold mb-2', isCanceling ? 'text-orange-600' : 'text-gray-800']">
          {{ isCanceling ? '松开取消发送' : '录音中...' }}
        </h3>
        <p class="text-sm text-gray-600 mb-4">
          {{ formatTime(recordingTime) }}
        </p>
        <div v-if="!isCanceling" class="flex justify-center gap-1 mb-4">
          <div
            v-for="i in 8"
            :key="i"
            :class="['w-1 rounded-full transition-all duration-100', recordingVolume > i * 12.5 ? 'bg-red-500' : 'bg-gray-300']"
            :style="{ height: `${(i + 1) * 4 + 8}px` }"
          ></div>
        </div>
        <div class="mb-4">
          <div class="flex items-center justify-center gap-2 text-sm">
            <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#666" style="transform: rotate(-90deg)">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </div>
            <span class="text-gray-500">上划取消</span>
          </div>
        </div>
        <div class="text-xs text-gray-500">
          {{ isCanceling ? '上划取消发送' : '松开手指发送语音' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  recordingTime: Number,
  recordingVolume: Number,
  isCanceling: Boolean
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>
