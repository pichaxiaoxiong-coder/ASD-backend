<template>
  <div class="flex min-h-screen flex-col page-bg">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />

    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-title">社交解码</div>
      <button @click="onThemeClick" class="theme-toggle" aria-label="夜间模式">
        <span class="text-sm">{{ timeOfDay === 'night' ? '☀' : '☾' }}</span>
      </button>
    </div>

    <main class="flex-1 overflow-y-auto page-container relative z-10 social-content">
      <div class="page-col">
        <!-- 顶部已包含模式切换，这里不重复 -->

        <!-- 星logo与文案 -->
        <div class="section text-center relative z-20" style="margin-top: clamp(20px, 3vh, 32px)">
          <p class="slogan-line" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-600'">学会社交，建立友谊</p>
        </div>

        <!-- 星角色展示 -->
        <div class="section flex justify-center">
          <div class="w-32 h-32 rounded-full flex items-center justify-center shadow"
               :class="timeOfDay === 'night' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/70'">
            <img src="/images/star-mascot.png" alt="星星" class="w-20 h-20 animate-float" />
          </div>
        </div>

        <!-- 训练标题 -->
        <div class="section text-center">
          <h2 class="title-text" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">社交技能训练</h2>
          <p class="body-text" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-600'">通过游戏学习社交技巧</p>
        </div>

        <!-- 社交练习功能按钮网格 -->
        <div class="section">
          <h2 class="mb-4 text-sm font-medium" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">社交练习</h2>
          <div class="grid grid-cols-2 gap-4">
            <button class="rounded-2xl p-6 text-center bg-[#fff1f6] shadow"
                    @click="goPath(`/emotion-game?mode=${isChildMode ? 'child' : 'parent'}`)">
              <div class="text-pink-500 text-xl mb-2">🙂</div>
              <div class="body-text text-gray-700">情绪识别</div>
            </button>
            <button class="rounded-2xl p-6 text-center bg-[#fff7f1] shadow"
                    @click="goPath(`/social-game/activities?mode=${isChildMode ? 'child' : 'parent'}`)">
              <div class="text-yellow-500 text-xl mb-2">🎮</div>
              <div class="body-text text-gray-700">社交游戏</div>
            </button>
          </div>
        </div>
      </div>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import { useThemeStore } from '@/stores/theme'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const isChildMode = ref(true)
const timeOfDay = ref<'day' | 'night'>('day')
const theme = useThemeStore()

 

const toggleNight = () => { theme.toggle(); updateTimeOfDay() }

const updateTimeOfDay = () => { timeOfDay.value = theme.darkMode ? 'night' : 'day' }

const goPath = (p: string) => { try { router.push(p) } catch {} }
 

onMounted(() => {
  theme.load()
  const savedMode = sessionStorage.getItem('启明星-mode')
  if (savedMode) isChildMode.value = savedMode === 'child'
  const urlMode = (router.currentRoute?.value.params?.mode as string) || undefined
  if (urlMode === 'child' || urlMode === 'parent') {
    isChildMode.value = urlMode === 'child'
    sessionStorage.setItem('启明星-mode', isChildMode.value ? 'child' : 'parent')
  }
  updateTimeOfDay()
})

const onThemeClick = () => { try { window.navigator?.vibrate?.(20) } catch {}; toggleNight(); const el = document.querySelector('.theme-toggle'); el?.classList.add('spin-once'); setTimeout(()=>el?.classList.remove('spin-once'), 300) }
</script>

<style scoped>
.page-container { display: flex; justify-content: center; }
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
.section { margin-bottom: 24px; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } .section { margin-bottom: 32px; } }
@media (max-width: 767px) { .section { margin-bottom: 20px; } }
.title-text { font-size: 18px; }
.body-text { font-size: 14px; }
@media (min-width: 1200px) { .title-text { font-size: 20px; } .body-text { font-size: 16px; } }
.social-content { padding-top: calc(var(--top-bar-height) + env(safe-area-inset-top, 0px)); padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px)); }
.top-nav { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0, 0, 0, 0.1); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.nav-title { font-size: 18px; font-weight: 600; color: #333; text-align: center; }
.theme-toggle { position: absolute; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: #f0f0f0; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.3s ease; }
.theme-toggle:hover { background: #e0e0e0; transform: scale(1.1); }
.theme-toggle:active { transform: scale(0.95); }
.social-content { margin-top: 60px; }
@media (max-width: 768px) { .top-nav { height: 56px; } .nav-title { font-size: 16px; } .theme-toggle { right: 12px; width: 28px; height: 28px; } .social-content { margin-top: 56px; } }
</style>
