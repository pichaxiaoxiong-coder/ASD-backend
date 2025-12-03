<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <template v-if="!isDarkMode">
      <!-- 底层大云：浅白，水平浮动 20s -->
      <div v-for="i in 3" :key="`cloud-base-${i}`" class="absolute" :style="cloudBaseStyle(i)">
        <svg width="220" height="120" viewBox="0 0 220 120" fill="none" style="opacity:.2">
          <ellipse cx="60" cy="70" rx="60" ry="40" fill="#ffffff" />
          <ellipse cx="120" cy="55" rx="70" ry="50" fill="#ffffff" />
          <ellipse cx="180" cy="75" rx="55" ry="38" fill="#ffffff" />
        </svg>
      </div>
      <!-- 中层云：浅蓝，垂直浮动 15s -->
      <div v-for="i in 4" :key="`cloud-mid-${i}`" class="absolute" :style="cloudMidStyle(i)">
        <svg width="160" height="90" viewBox="0 0 160 90" fill="none" style="opacity:.4">
          <ellipse cx="40" cy="50" rx="40" ry="30" fill="#D6EFFF" />
          <ellipse cx="90" cy="40" rx="50" ry="35" fill="#D6EFFF" />
          <ellipse cx="130" cy="55" rx="35" ry="26" fill="#D6EFFF" />
        </svg>
      </div>
      <!-- 顶层粉紫小云：标题区点缀 -->
      <div class="absolute" :style="{ top: '8%', left: '12%' }">
        <svg width="90" height="50" viewBox="0 0 90 50" fill="none" style="opacity:.3">
          <ellipse cx="25" cy="30" rx="25" ry="18" fill="#F5E6FF" />
          <ellipse cx="50" cy="22" rx="28" ry="20" fill="#F5E6FF" />
        </svg>
      </div>
      <!-- 日间星星点缀：金色大星旋转、蓝色小星闪烁 -->
      <div v-for="i in 2" :key="`sun-star-${i}`" class="absolute" :style="bigDayStarStyle(i)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFF5D6" style="opacity:.3">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </template>

    <template v-else>
      <div 
        v-for="i in 50" 
        :key="`star-${i}`"
        class="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
        :style="getStarStyle(i)"
      />
      <div 
        v-for="i in 3" 
        :key="`meteor-${i}`"
        class="absolute w-1 h-1 bg-white rounded-full animate-meteor"
        :style="getMeteorStyle(i)"
      />
      <div 
        v-for="i in 8" 
        :key="`big-star-${i}`"
        class="absolute text-yellow-300 opacity-60"
        :style="getBigStarStyle(i)"
      >
        ⭐
      </div>
    </template>

    <div class="absolute top-1/4 left-1/4 opacity-10">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffcc5c">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
    <div class="absolute bottom-1/3 right-1/4 opacity-10">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#06b6d4">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isDarkMode: Boolean
})

const cloudBaseStyle = (i) => {
  const pos = [
    { top:'18%', left:'-4%' },
    { top:'26%', left:'40%' },
    { top:'60%', left:'10%' }
  ][i-1]
  return { ...pos, animation: 'float-x 20s ease-in-out infinite' }
}
const cloudMidStyle = (i) => {
  const pos = [
    { top:'24%', left:'12%' },
    { top:'38%', left:'70%' },
    { top:'52%', left:'30%' },
    { top:'68%', left:'55%' }
  ][i-1]
  return { ...pos, animation: 'float-y 15s ease-in-out infinite' }
}
const bigDayStarStyle = (i) => {
  const pos = [
    { top:'12%', left:'25%' },
    { top:'42%', left:'78%' }
  ][i-1]
  return { ...pos, animation: 'rotate-slow 30s linear infinite' }
}

const getStarStyle = (index) => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 3}s`,
  animationDuration: `${2 + Math.random() * 2}s`
})

const getMeteorStyle = (index) => ({
  top: `${Math.random() * 30}%`,
  right: `${Math.random() * 30}%`,
  animationDelay: `${index * 2}s`,
  animationDuration: '1.5s'
})

const getBigStarStyle = (index) => ({
  top: `${10 + Math.random() * 80}%`,
  left: `${10 + Math.random() * 80}%`,
  animationDelay: `${Math.random() * 2}s`,
  animation: 'twinkle 3s ease-in-out infinite'
})
</script>
