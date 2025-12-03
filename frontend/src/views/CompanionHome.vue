<template>
  <div class="child-mode-container page-bg">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />
    <div class="top-nav fixed top-0 left-0 right-0">
      <div class="nav-title">成长陪伴</div>
      <button @click="onThemeClick" class="theme-toggle" aria-label="夜间模式">
        <span class="text-sm">{{ timeOfDay === 'night' ? '☀' : '☾' }}</span>
      </button>
    </div>

    <div class="growth-companion-clouds" aria-hidden="true">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
    </div>

    <div class="child-content">
    <main class="page-container relative z-10 pb-0">
      <div class="page-col">
        <!-- 顶部已提供模式切换，这里取消重复 -->
        <!-- 文案（保留，无顶部静态星图） -->
        <div class="section text-center relative z-20" style="margin-top: clamp(20px, 3vh, 32px)">
          <p class="slogan-line font-medium" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-700'">每一颗星星都有自己的光芒</p>
        </div>

        <!-- 星角色（保留上下浮动，并在情绪选择后给予安慰动作与话语） -->
        <div class="section flex justify-center relative">
          <div class="w-32 h-32 rounded-full flex items-center justify-center shadow relative star-glow" :class="timeOfDay === 'night' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/70'">
            <img src="/images/star-mascot.png" alt="星星" class="w-20 h-20 animate-float" :class="starEmotion ? 'animate-bounce' : ''" />
          </div>
          <transition name="fade">
            <div v-if="starEmotion" class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 text-gray-800 rounded-full px-4 py-2 shadow">
              {{ starEmotion.message }}
            </div>
          </transition>
        </div>

        <div class="section text-center">
          <h2 class="title-text mb-1" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">你好！我是启明星小助手</h2>
          <p class="body-text" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-600'">今天也要开心成长哦～</p>
        </div>

        <!-- 心情打卡 -->
        <div class="section">
          <div class="text-center mb-4">
            <h3 class="title-text font-semibold" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">你今天感觉怎么样?</h3>
          </div>
          <div class="grid grid-cols-3 gap-5">
            <button @click="onEmotion('happy')" class="rounded-2xl p-5 shadow-sm emotion-button-glass">
              <div class="text-2xl mb-2">😊</div>
              <div class="body-text text-gray-600">开心</div>
            </button>
            <button @click="onEmotion('okay')" class="rounded-2xl p-5 shadow-sm emotion-button-glass">
              <div class="text-2xl mb-2">😐</div>
              <div class="body-text text-gray-600">一般</div>
            </button>
            <button @click="onEmotion('sad')" class="rounded-2xl p-5 shadow-sm emotion-button-glass">
              <div class="text-2xl mb-2">😢</div>
              <div class="body-text text-gray-600">有点难过</div>
            </button>
          </div>
        </div>

        <!-- 与启明星对话卡片 -->
        <div class="section">
          <h2 class="mb-4 text-sm font-medium" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">成长陪伴</h2>
          <div class="rounded-2xl p-6 chat-card" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/50 backdrop-blur-sm'">
            <div class="text-center mb-4">
              <h3 class="title-text font-semibold mb-2" :class="timeOfDay === 'night' ? '' : 'text-gray-800'" :style="timeOfDay === 'night' ? { color: 'rgba(20, 33, 100, 0.9)' } : undefined">与启明星对话</h3>
              <p class="body-text" :class="timeOfDay === 'night' ? '' : 'text-gray-600'" :style="timeOfDay === 'night' ? { color: 'rgba(20, 33, 100, 0.9)' } : undefined">AI助手陪伴你成长，解答问题，分享快乐</p>
            </div>
            <div class="flex gap-3">
              <button class="flex-1 rounded-full h-11 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" @click="goChat">
                开始对话
              </button>
              <button class="rounded-full h-11 px-4" :class="timeOfDay === 'night' ? 'bg-white/20 text-white' : 'border border-gray-200'" @click="goChat">▶</button>
            </div>
          </div>
        </div>
        

        <!-- 今日小任务（保证显示完全） -->
        <div class="section">
          <div class="rounded-2xl p-5 bg-white/90 backdrop-blur-sm flex items-center justify-between gap-4 min-h-[72px] task-card task-card-container">
            <button class="task-checkbox" :class="taskCompleted ? 'checked' : ''" @click="toggleTaskComplete" aria-label="完成今日任务"></button>
            <div class="flex-1">
              <div class="body-text font-medium text-gray-700">今日小任务</div>
              <div class="body-text text-gray-600 mt-2">和星星一起笑一笑 😊</div>
            </div>
            <div class="body-text text-gray-500 whitespace-nowrap">每日一练</div>
            <transition name="fade">
              <div v-if="showMotivationTip" class="motivation-tip-simple">
                太棒了！你完成了今天的任务，继续加油！
              </div>
            </transition>
          </div>
        </div>
      </div>
    </main>
    </div>

    
    
    <!-- 底部导航栏 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const route = useRoute()
const isChildMode = ref(true)
const timeOfDay = ref<'day' | 'night'>('day')
const theme = useThemeStore()
const starEmotion = ref<{ emoji: string; message: string } | null>(null)

const taskCompleted = ref(false)
const showMotivationTip = ref(false)
let tipTimer: number | null = null
const toggleTaskComplete = () => {
  taskCompleted.value = !taskCompleted.value
  if (taskCompleted.value) {
    showMotivationTip.value = true
    if (tipTimer) { clearTimeout(tipTimer); tipTimer = null }
    tipTimer = window.setTimeout(() => { showMotivationTip.value = false }, 3000)
  } else {
    showMotivationTip.value = false
    if (tipTimer) { clearTimeout(tipTimer); tipTimer = null }
  }
}
onBeforeUnmount(() => { if (tipTimer) { clearTimeout(tipTimer); tipTimer = null } })

 

const toggleNight = () => { theme.toggle(); updateTimeOfDay() }

const updateTimeOfDay = () => { timeOfDay.value = theme.darkMode ? 'night' : 'day' }

const onEmotion = (emotion: 'happy' | 'okay' | 'sad') => {
  const map = {
    happy: { emoji: '😊', message: '太好啦！把快乐传给星星吧～' },
    okay: { emoji: '😐', message: '星星陪你一起平平常常也很好～' },
    sad: { emoji: '😢', message: '星星抱抱你，我们深呼吸一口气～' },
  } as const
  starEmotion.value = map[emotion]
  setTimeout(() => { starEmotion.value = null }, 3000)
}

const goChat = () => {
  router.push('/companion')
}


 

onMounted(() => {
  theme.load()
  const savedMode = sessionStorage.getItem('启明星-mode')
  if (savedMode) isChildMode.value = savedMode === 'child'
  const paramMode = route.params.mode as string | undefined
  if (paramMode === 'child' || paramMode === 'parent') {
    isChildMode.value = paramMode === 'child'
    sessionStorage.setItem('启明星-mode', isChildMode.value ? 'child' : 'parent')
  }
  updateTimeOfDay()
})

const onThemeClick = () => { try { window.navigator?.vibrate?.(20) } catch {}; toggleNight(); const el = document.querySelector('.theme-toggle'); el?.classList.add('spin-once'); setTimeout(()=>el?.classList.remove('spin-once'), 300) }

// 背景调节按钮相关逻辑已移除

onMounted(() => {
  if ((import.meta as any).env && (import.meta as any).env.DEV) {
    try {
      console.log('=== 网络请求检查 ===')
      window.addEventListener('error', function(e: any) {
        const t = e?.target as any
        if (t && t.tagName === 'LINK' && t.rel === 'stylesheet') {
          console.log('❌ CSS文件加载失败:', t.href)
        }
      }, true)
      console.log('请在Network面板中检查:')
      console.log('1. 过滤".css"文件，查看是否有404错误')
      console.log('2. 查看文件修改时间是否最新')
      console.log('3. 勾选"Disable cache"后刷新页面')

      const selectors = ['.motivation-tip-simple', '.task-toast', '[class*="toast"]']
      let foundSel = ''
      let toastEl: HTMLElement | null = null
      for (const s of selectors) { const el = document.querySelector(s) as HTMLElement | null; if (el) { foundSel = s; toastEl = el; break } }
      if (toastEl) {
        console.log('开始直接修改样式测试...')
        try {
          const cs = getComputedStyle(toastEl)
          console.log('✅ 找到提示框元素，选择器:', foundSel)
          console.log('当前z-index:', cs.zIndex)
          console.log('当前position:', cs.position)
          console.log('top:', cs.top, 'bottom:', cs.bottom)
        } catch {}
        try {
          toastEl.style.zIndex = '10010'
          toastEl.style.position = 'fixed'
          toastEl.style.left = '50%'
          toastEl.style.transform = 'translateX(-50%)'
          toastEl.style.backgroundColor = 'red'
          toastEl.style.padding = '20px'
          toastEl.style.border = '3px solid yellow'
          try { (toastEl.style as any).setProperty('top', 'auto', 'important') } catch {}
          try { (toastEl.style as any).setProperty('bottom', '80px', 'important') } catch {}
          console.log('✅ 已添加测试样式，请查看页面变化')
          console.log('如果样式生效，说明选择器正确但CSS未正确应用')
        } catch (e) { console.log('样式修改失败', e) }
      } else {
        console.log('=== 检查Vue组件状态 ===')
        try { console.log('组件已挂载:', true) } catch {}
        try {
          const hiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [class*="hide"]')
          console.log('隐藏的元素数量:', hiddenElements.length)
        } catch {}
        try {
          const shadowHosts = document.querySelectorAll('*')
          shadowHosts.forEach(el => { const sr = (el as any).shadowRoot; if (sr) { const shadowToast = sr.querySelector('[class*="toast"]'); if (shadowToast) { console.log('⚠️ 提示框可能在Shadow DOM中:', el) } } })
        } catch {}
      }

      try {
        const style = document.createElement('style')
        style.textContent = `
          .task-toast, [class*="toast"], .van-toast, .ant-message, .el-message, .motivation-tip-simple {
            z-index: 99999 !important;
            position: fixed !important;
            bottom: 80px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background-color: rgba(0, 0, 0, 0.9) !important;
            color: white !important;
            padding: 15px 25px !important;
            border-radius: 25px !important;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3) !important;
            font-size: 16px !important;
            border: 3px solid #ff0000 !important;
            top: auto !important;
          }
          @media (max-width: 768px) {
            .task-toast, [class*="toast"], .van-toast, .ant-message, .el-message, .motivation-tip-simple {
              bottom: 70px !important;
              font-size: 14px !important;
            }
          }
        `
        document.head.appendChild(style)
        console.log('✅ 已注入全局样式，请触发提示框查看效果')
      } catch {}
    } catch (e) {
      console.log('诊断执行异常', e)
    }
  }
})
</script>

<style scoped>
.top-nav { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0, 0, 0, 0.1); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.nav-title { font-size: 18px; font-weight: 600; color: #333; text-align: center; }
.theme-toggle { position: absolute; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: #f0f0f0; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.3s ease; }
.theme-toggle:hover { background: #e0e0e0; transform: scale(1.1); }
.theme-toggle:active { transform: scale(0.95); }
@media (max-width: 768px) { .top-nav { height: 56px; } .nav-title { font-size: 16px; } .theme-toggle { right: 12px; width: 28px; height: 28px; } }
.task-checkbox { width: 22px; height: 22px; min-width: 22px; min-height: 22px; border-radius: 6px; border: 2px solid #e5e7eb; background: #fff; display: inline-flex; align-items: center; justify-content: center; transition: all .2s ease; }
.task-checkbox { margin-left: 20px; align-self: center; }
.task-checkbox.checked { border-color: #10B981; background: #10B981; color: #fff; }
.task-checkbox.checked::after { content: '✓'; font-size: 14px; line-height: 1; }
.task-checkbox:active { transform: scale(0.96); }
.fade-enter-active, .fade-leave-active { transition: opacity .5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 768px) { .task-checkbox { margin-left: 15px; } }
.task-card { position: relative; }
.motivation-tip-simple { position: fixed !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 10010 !important; background: #F0FFF7 !important; border: 1px solid #10B981 !important; padding: 12px 20px !important; border-radius: 8px !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important; white-space: nowrap !important; font-size: 14px !important; color: #065F46 !important; text-align: center !important; top: 70% !important; }
@media (max-width: 768px) {
  .motivation-tip-simple { top: 70% !important; bottom: auto !important; padding: 10px 16px !important; font-size: 13px !important; max-width: 85% !important; }
}
.child-mode-container { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; position: relative; overflow-x: hidden; overflow-y: visible; }
.child-mode-container * { box-sizing: border-box; }
.child-content { flex: 1; padding: 20px 15px; padding-top: calc(var(--top-bar-height) + env(safe-area-inset-top, 0px)); padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); overflow-y: hidden !important; background: transparent; -webkit-overflow-scrolling: touch; margin-top: 24px; }
/* 居中列与响应式断点 */
.page-container { display: flex; justify-content: center; }
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
.section { margin-bottom: var(--block-gap, 20px); }

/* 手机默认 */
.title-text { font-size: 16px; line-height: 1.4; }
.body-text { font-size: 14px; line-height: 1.6; }

/* 与启明星对话卡片白色半透明背景 */
.chat-card { background: rgba(255, 255, 255, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; border: 1px solid rgba(255, 255, 255, 0.25) !important; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06) !important; }
@media (max-width: 768px) { .chat-card { background: rgba(255, 255, 255, 0.92) !important; } }

/* 情绪按钮半透明白框风格，与聊天卡片一致 */
.emotion-button-glass { background: rgba(255,255,255,0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; border: 1px solid rgba(124,58,237,0.35) !important; border-radius: 8px !important; position: relative; overflow: hidden; }
.emotion-button-glass:hover { background: rgba(255,255,255,0.6) !important; background-image:
  radial-gradient(closest-side, rgba(255,255,255,0.8) 0 99%, transparent 100%) 6% 12% / 3px 3px no-repeat,
  radial-gradient(closest-side, rgba(255,255,255,0.7) 0 99%, transparent 100%) 94% 18% / 2px 2px no-repeat,
  radial-gradient(closest-side, rgba(255,255,255,0.6) 0 99%, transparent 100%) 10% 88% / 2.5px 2.5px no-repeat;
}
@media (max-width: 768px) { .emotion-button-glass { background: rgba(255,255,255,0.92) !important; } }

/* 背景与社交解码统一：不覆盖全局 .page-bg 与装饰 */
.growth-companion-clouds { display: none !important; }

/* 自定义统一云朵动效容器与样式 */
.growth-companion-clouds { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.cloud { position: absolute; opacity: 0.75; width: 200px; height: 80px; border-radius: 40px; background:
  radial-gradient(closest-side, #ffffff 0 99%, transparent 100%) 20% 60% / 50px 50px no-repeat,
  radial-gradient(closest-side, #ffffff 0 99%, transparent 100%) 45% 40% / 70px 70px no-repeat,
  radial-gradient(closest-side, #ffffff 0 99%, transparent 100%) 70% 65% / 55px 55px no-repeat,
  linear-gradient(#ffffff, #ffffff);
}
.cloud-1 { top: 20%; left: -25%; animation: cloud-flow 80s linear infinite; }
.cloud-2 { top: 40%; left: -30%; width: 150px; height: 60px; animation: cloud-flow 100s linear infinite; border-radius: 30px; }
@keyframes cloud-flow {
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(25vw) translateY(5px); }
  50% { transform: translateX(50vw) translateY(0); }
  75% { transform: translateX(75vw) translateY(-5px); }
  100% { transform: translateX(120vw) translateY(0); }
}
@media (max-width: 768px) { .child-content { margin-top: 12px; padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px)); min-height: calc(100dvh - 56px - 100px); } .cloud { width: 140px; height: 56px; border-radius: 28px; } .cloud-2 { width: 110px; height: 44px; border-radius: 22px; } }

@media (min-width: 769px) { .child-content { min-height: calc(100vh - 60px - 80px); } }

/* 仅电脑端：文字垂直居中 */
@media (min-width: 769px) {
  .motivation-tip-simple {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

</style>

<style>
/* 禁用页面滚动 */
html, body, #app, .app-container {
  overflow: hidden !important;
  height: 100vh !important;
}

/* 确保成长陪伴页面容器也禁用滚动 */
.growth-page, .companion-container, .page-content {
  overflow: hidden !important;
  height: 100% !important;
}
</style>
