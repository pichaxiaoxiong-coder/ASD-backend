<template>
  <div class="flex min-h-screen flex-col page-bg">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />
    <div class="top-nav">
      <div class="nav-title">我的</div>
      <button @click="onThemeClick" class="theme-toggle" aria-label="夜间模式">
        <span class="text-sm">{{ timeOfDay === 'night' ? '☀' : '☾' }}</span>
      </button>
    </div>
    <main class="flex-1 overflow-y-auto profile-content">
      <div class="mx-auto page-col px-6 py-8">
        <!-- 头部资料卡 -->
        <div class="section flex justify-center">
          <div class="card w-full max-w-xl p-6 flex items-center gap-4" style="border-color:#F8E2E8; background:#FFF9F5; border-radius:12px">
            <label class="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-400 cursor-pointer">
              <img v-if="avatarPreview || user?.avatar" :src="avatarPreview || user?.avatar" alt="avatar" class="w-full h-full object-cover" />
              <input type="file" accept="image/*" class="absolute inset-0 opacity-0" @change="onAvatarChange" />
            </label>
            <div class="flex-1">
              <p class="text-[18px] font-semibold text-gray-800">{{ form.name }}</p>
              <p class="text-[14px] text-gray-500">{{ form.phone || '未绑定手机号' }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="router.push('/profile/edit')" class="btn h-10 px-4 bg-[#E8F4FF] text-[#1677FF] text-sm ripple">编辑资料</button>
              <button @click="handleLogout" class="h-10 px-4 rounded-full bg-red-500 text-white text-sm shadow hover:brightness-110 active:scale-95 transition">退出登录</button>
            </div>
          </div>
        </div>

        <!-- 功能网格 2x3 -->
        <div class="section btn-grid">
          <button class="func-btn ripple" @click="router.push('/profile/edit')">
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3 0-9 1.5-9 4v1h18v-1c0-2.5-6-4-9-4z"/></svg>
            <span class="text-sm">个人资料</span>
          </button>
          <button class="func-btn ripple" @click="router.push('/settings')">
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04,-0.31 0.06,-0.63 0.06,-0.94s-0.02,-0.63 -0.06,-0.94l2.03,-1.58c0.18,-0.14 0.23,-0.41 0.12,-0.61l-1.92,-3.32c-0.11,-0.2 -0.36,-0.28 -0.57,-0.2l-2.39,0.96c-0.5,-0.38 -1.04,-0.7 -1.64,-0.94l-0.36,-2.54c-0.03,-0.22 -0.22,-0.39 -0.45,-0.39h-3.84c-0.23,0 -0.42,0.17 -0.45,0.39l-0.36,2.54c-0.6,0.24 -1.14,0.56 -1.64,0.94l-2.39,-0.96c-0.21,-0.08 -0.46,0 -0.57,0.2l-1.92,3.32c-0.11,0.2 -0.06,0.47 0.12,0.61l2.03,1.58c-0.04,0.31 -0.06,0.63 -0.06,0.94s0.02,0.63 0.06,0.94l-2.03,1.58c-0.18,0.14 -0.23,0.41 -0.12,0.61l1.92,3.32c0.11,0.2 0.36,0.28 0.57,0.2l2.39,-0.96c0.5,0.38 1.04,0.7 1.64,0.94l0.36,2.54c0.03,0.22 0.22,0.39 0.45,0.39h3.84c0.23,0 0.42,-0.17 0.45,-0.39l0.36,-2.54c0.6,-0.24 1.14,-0.56 1.64,-0.94l2.39,0.96c0.21,0.08 0.46,0 0.57,-0.2l1.92,-3.32c0.11,-0.2 0.06,-0.47 -0.12,-0.61l-2.03,-1.58ZM12,15.5c-1.93,0 -3.5,-1.57 -3.5,-3.5s1.57,-3.5 3.5,-3.5 3.5,1.57 3.5,3.5 -1.57,3.5 -3.5,3.5Z"/></svg>
            <span class="text-sm">应用设置</span>
          </button>
          <button class="func-btn ripple" @click="router.push('/profile/notifications')">
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v7l-2 2v1h16v-1l-2-2z"/></svg>
            <span class="text-sm">通知设置</span>
          </button>
          <button class="func-btn ripple" @click="router.push('/privacy-security')">
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z"/></svg>
            <span class="text-sm">隐私安全</span>
          </button>
          <button class="func-btn ripple" @click="router.push('/help')">
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zm-1-6h2v2h-2v-2zm2.1-1.9l.9-.9c.5-.5.9-1.1.9-1.9 0-1.7-1.3-3-3-3s-3 1.3-3 3h2c0-.6.4-1 1-1s1 .4 1 1c0 .3-.1.5-.3.7l-1.2 1.2c-.3.3-.5.7-.5 1.1V16h2v-1.9z"/></svg>
            <span class="text-sm">帮助中心</span>
          </button>
          <button class="func-btn ripple" @click="router.push('/settings')">
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span class="text-sm">关于应用</span>
          </button>
        </div>
      </div>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const timeOfDay = ref<'day' | 'night'>('day')
const theme = useThemeStore()
const toggleNight = () => { theme.toggle(); timeOfDay.value = theme.darkMode ? 'night' : 'day' }

const userStore = useUserStore()
const user = ref<any>(null)
const form = ref({ name: '', phone: '' })
const avatarPreview = ref<string | null>(null)

const onAvatarChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { avatarPreview.value = reader.result as string }
  reader.readAsDataURL(file)
}

//
const handleLogout = async () => { await userStore.logout(); router.push('/login') }

onMounted(async () => {
  theme.load(); timeOfDay.value = theme.darkMode ? 'night' : 'day'
  await userStore.load(); user.value = userStore.user; if (user.value) form.value = { name: user.value.name, phone: user.value.phone || '' }
  const quickJumpBtn = document.querySelector('.quick-jump'); if (quickJumpBtn) quickJumpBtn.remove()
  const quickNavigate = document.querySelector('[class*="quick"]'); if (quickNavigate) quickNavigate.remove()
})

const onThemeClick = () => { try { window.navigator?.vibrate?.(20) } catch {}; toggleNight(); const el = document.querySelector('.theme-toggle'); el?.classList.add('spin-once'); setTimeout(()=>el?.classList.remove('spin-once'), 300) }
</script>

<style scoped>
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.section { margin-bottom: 24px; }
.title-text { font-size: 18px; }
.body-text { font-size: 14px; }
@media (min-width: 1200px) { .title-text { font-size: 20px; } .body-text { font-size: 16px; } }
.profile-content { padding-top: calc(var(--top-bar-height) + env(safe-area-inset-top, 0px)); padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px)); }

.top-nav { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0, 0, 0, 0.1); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.nav-title { font-size: 18px; font-weight: 600; color: #333; text-align: center; }
.theme-toggle { position: absolute; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: #f0f0f0; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.3s ease; }
.theme-toggle:hover { background: #e0e0e0; transform: scale(1.1); }
.theme-toggle:active { transform: scale(0.95); }
.profile-content { margin-top: 0; padding-top: 60px; }
@media (max-width: 768px) { .top-nav { height: 56px; } .nav-title { font-size: 16px; } .theme-toggle { right: 12px; width: 28px; height: 28px; } .profile-content { margin-top: 0; padding-top: 56px; } }
</style>
