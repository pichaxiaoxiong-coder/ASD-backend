<template>
  <div :class="['flex gap-3', message.type === 'user' ? 'justify-end' : 'justify-start']">
    <img 
      v-if="message.type === 'ai'" 
      :src="starAvatar" 
      alt="启明星" 
      class="w-8 h-8 flex-shrink-0 rounded-full object-cover"
    />
    <div
      :class="[
        'max-w-[70%] rounded-[16px] px-4 py-3 my-2 bubble-shadow',
        message.type === 'user'
          ? 'bubble-user text-white ml-auto'
          : 'bubble-ai text-gray-800 mr-auto'
      ]"
    >
      <div v-if="message.mediaType === 'image' && message.mediaUrl" class="mb-2">
        <img :src="message.mediaUrl" alt="用户上传的图片" class="max-w-full h-auto rounded-lg" />
      </div>
      <div v-if="message.mediaType === 'voice' && message.duration" class="flex items-center gap-2 mb-2">
        <button class="p-1 hover:scale-110 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <div class="flex-1 bg-black/10 rounded-full h-2">
          <div class="bg-current h-2 rounded-full w-1/3"></div>
        </div>
        <span class="text-xs">{{ formatTime(message.duration) }}</span>
      </div>
      <p class="text-sm leading-relaxed">{{ message.content }}</p>
      <div :class="['text-xs mt-1', message.type === 'user' ? 'text-blue-100' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')]">
        {{ formatTimestamp(message.timestamp) }}
      </div>
    </div>
    <div 
      v-if="message.type === 'user'" 
      class="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: Object,
  starAvatar: String,
  isDarkMode: Boolean
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatTimestamp = (date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.bubble-ai { background: linear-gradient(135deg, #E3F2FD, #F0F7FF); }
.bubble-user { background: linear-gradient(135deg, #667eea, #764ba2); }
.bubble-shadow { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
</style>
