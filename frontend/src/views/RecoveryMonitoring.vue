<template>
  <div class="app-container unified-theme page-bg recovery-monitoring-bg" :class="isChildMode ? 'child-mode' : 'parent-mode'">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />

    <!-- 顶部栏（对齐成长陪伴页面） -->
    <div class="top-nav">
      <div class="nav-title">康复监测</div>
      <button @click="onThemeClick" class="theme-toggle" aria-label="夜间模式">
        <span class="text-sm">{{ timeOfDay === 'night' ? '☀' : '☾' }}</span>
      </button>
    </div>

    <!-- 主体内容 -->
    <main class="content-area relative z-10">
      <div class="mx-auto page-col px-6 py-5">
        <div class="section text-center">
          <h2 class="title-text" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">康复监测</h2>
        </div>

        <div class="section flex justify-center">
          <div class="w-32 h-32 rounded-full flex items-center justify-center shadow"
               :class="timeOfDay === 'night' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/70'">
            <img src="/images/star-mascot.png" alt="星星" class="w-20 h-20 animate-float" />
          </div>
        </div>

        <div class="section">
          <div class="func-grid">
            <button id="btn-progress" class="func-card" type="button">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#50C878"><path d="M12 21s-6.16-4.35-8.28-6.47A5.86 5.86 0 013.72 5a5.42 5.42 0 017.13.44l1.15 1.14 1.15-1.14A5.42 5.42 0 0120.28 5a5.86 5.86 0 01-.01 9.53C18.16 16.65 12 21 12 21z"/></svg>
              <span>进度统计</span>
            </button>
            <button id="btn-growth" class="func-card" type="button">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7" stroke="#3A80D2" stroke-width="2" />
                <circle cx="12" cy="12" r="3.5" stroke="#3A80D2" stroke-width="2" />
              </svg>
              <span>成长曲线</span>
            </button>
            <button class="func-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" fill="#9AAABC" />
                <rect x="6" y="9" width="12" height="2" fill="#FFFFFF" opacity=".85" />
                <rect x="6" y="13" width="9" height="2" fill="#FFFFFF" opacity=".85" />
                <rect x="7" y="2" width="3" height="4" fill="#9AAABC" />
                <rect x="14" y="2" width="3" height="4" fill="#9AAABC" />
              </svg>
              <span>活动记录</span>
            </button>
            <button class="func-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M4 5h14a3 3 0 013 3v7a3 3 0 01-3 3H10l-4 3v-3H4a3 3 0 01-3-3V8a3 3 0 013-3z" fill="#FFCC4D" />
                <circle cx="18" cy="8" r="2" fill="#FFE38A" />
              </svg>
              <span>成就徽章</span>
            </button>
          </div>
        </div>

        <div class="section">
          <div class="skill-card">
            <div class="skill-row">
              <span class="skill-name">社交技能</span>
              <span class="skill-pct">75%</span>
              <div class="bar">
                <div class="bar-fill teal" style="width:75%"></div>
              </div>
            </div>
            <div class="skill-row">
              <span class="skill-name">情绪识别</span>
              <span class="skill-pct">68%</span>
              <div class="bar">
                <div class="bar-fill pink" style="width:68%"></div>
              </div>
            </div>
            <div class="skill-row">
              <span class="skill-name">沟通能力</span>
              <span class="skill-pct">82%</span>
              <div class="bar">
                <div class="bar-fill cyan" style="width:82%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 练习计时卡片 -->
        <div class="section rounded-2xl p-6" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="title-text font-semibold">专注练习计时</h3>
            <div class="text-sm" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-500'">目标：15 分钟</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="rounded-full w-24 h-24 flex items-center justify-center shadow-inner" :class="timeOfDay === 'night' ? 'bg-white/10' : 'bg-white'">
              <span class="text-xl font-bold">{{ formatTime(elapsedSeconds) }}</span>
            </div>
            <div class="flex-1">
              <div class="h-3 rounded bg-gray-200 overflow-hidden">
                <div class="h-3 bg-blue-500" :style="{ width: progressPct + '%' }"></div>
              </div>
              <div class="mt-2 text-xs" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">进度 {{ progressPct.toFixed(0) }}%</div>
            </div>
          </div>
          <div class="mt-4 flex gap-3">
            <button v-if="!isRunning" @click="startTimer" class="btn btn-primary flex-1 h-10 active:scale-95">开始</button>
            <button v-else @click="pauseTimer" class="btn btn-danger flex-1 h-10 active:scale-95">暂停</button>
            <button @click="resetTimer" class="btn btn-secondary flex-1 h-10 active:scale-95">重置</button>
          </div>
        </div>

        <!-- 数据记录与验证 -->
        <div class="section standard-card practice-record" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <h3 class="title-text font-semibold mb-3">练习记录</h3>
          <form @submit.prevent="handleSubmitRecord" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="text-sm">
                <span class="block mb-1">完成次数</span>
                <input v-model.number="recordForm.reps" type="number" min="0" class="w-full rounded border px-3 py-2" required />
              </label>
              <label class="text-sm">
                <span class="block mb-1">主观难度(1-5)</span>
                <input v-model.number="recordForm.difficulty" type="number" min="1" max="5" class="w-full rounded border px-3 py-2" required />
              </label>
            </div>
            <label class="text-sm block">
              <span class="block mb-1">备注</span>
              <textarea v-model="recordForm.note" rows="2" class="w-full rounded border px-3 py-2" placeholder="可填写练习情况" />
            </label>
            <div class="flex gap-3">
              <button type="submit" class="btn btn-primary flex-1 h-10 active:scale-95" :disabled="isSubmitting">提交记录</button>
              <button type="button" @click="clearRecord" class="btn btn-secondary flex-1 h-10 active:scale-95">清空</button>
            </div>
            <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
          </form>
        </div>

        <!-- 最近进度 -->
        <div class="section standard-card progress-section" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <div class="flex items-center justify-between mb-2">
            <h3 class="title-text font-semibold">最近进度</h3>
            <span class="text-xs" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">近 7 次</span>
          </div>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="(p, i) in recentProgress" :key="i" class="h-12 rounded flex items-end" :style="{ background: 'linear-gradient(180deg, rgb(211 253 147 / 48%) ' + p + '%, rgb(229 231 235 / 13%) ' + p + '%)' }"></div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import { useThemeStore } from '@/stores/theme'
import BottomNav from '@/components/BottomNav.vue'
import { getMode } from '@/lib/mode'

const timeOfDay = computed(() => theme.darkMode ? 'night' : 'day')
const theme = useThemeStore()
const toggleNight = () => { theme.toggle() }
const isChildMode = ref(getMode() === 'child')

const elapsedSeconds = ref(0)
const isRunning = ref(false)
let timerId: any = null
const targetSeconds = 15 * 60
const progressPct = computed(() => Math.min(100, (elapsedSeconds.value / targetSeconds) * 100))

const startTimer = () => { if (isRunning.value) return; isRunning.value = true; timerId = setInterval(() => { elapsedSeconds.value += 1 }, 1000) }
const pauseTimer = () => { isRunning.value = false; if (timerId) clearInterval(timerId) }
const resetTimer = () => { pauseTimer(); elapsedSeconds.value = 0 }
const formatTime = (s: number) => { const m = Math.floor(s / 60).toString().padStart(2, '0'); const ss = (s % 60).toString().padStart(2, '0'); return `${m}:${ss}` }

const recordForm = ref({ reps: 0, difficulty: 3, note: '' })
const isSubmitting = ref(false)
const submitError = ref('')
const recentProgress = ref<number[]>([20, 40, 60, 30, 50, 70, 90])

 
const handleSubmitRecord = async () => {
  submitError.value = ''
  if (recordForm.value.reps <= 0) { submitError.value = '请填写完成次数'; return }
  if (recordForm.value.difficulty < 1 || recordForm.value.difficulty > 5) { submitError.value = '难度需在1-5之间'; return }
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 600))
  // 模拟成功写入与进度更新
  recentProgress.value = [...recentProgress.value.slice(1), Math.min(100, recordForm.value.reps * 10)]
  isSubmitting.value = false
}

const clearRecord = () => { recordForm.value = { reps: 0, difficulty: 3, note: '' }; submitError.value = '' }

onMounted(() => { theme.load(); try { window.addEventListener('modeChanged', (e: any) => { const m = e?.detail?.mode; if (m === 'child' || m === 'parent') isChildMode.value = m === 'child' }) } catch {} })

const onThemeClick = () => { try { window.navigator?.vibrate?.(20) } catch {}; toggleNight(); const el = document.querySelector('.theme-toggle'); el?.classList.add('spin-once'); setTimeout(()=>el?.classList.remove('spin-once'), 300) }
</script>

<style scoped>
.app-container { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; overflow-x: hidden; overflow-y: visible; }
.top-nav { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0, 0, 0, 0.1); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.nav-title { font-size: 18px; font-weight: 600; color: #333; text-align: center; }
.theme-toggle { position: absolute; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: #f0f0f0; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.3s ease; }
.theme-toggle:hover { background: #e0e0e0; transform: scale(1.1); }
.theme-toggle:active { transform: scale(0.95); }
.content-area { flex: 1; padding-top: 0; padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px)); }
.content-area { margin-top: 60px; }
.unified-theme {
  --bg: #F8F9FA;
  --primary: #a8eeb9;
  --primary-dark: #eff2c2;
  --success: #50C878;
  --warning: #FF7E5A;
  --text: #2C3E50;
  --muted: #7F8C8D;
  --card-bg: #FFFFFF;
  --card-border: #E5E7EB;
  --radius: 12px;
  --shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.btn { border: none; padding: 10px 16px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
.btn-primary { background: linear-gradient(90deg, var(--primary), var(--primary-dark)); color:#fff }
.btn-secondary { background:#fff; color: var(--primary); border:1px solid var(--primary) }
.btn-success { background: var(--success); color:#fff }
.btn-danger { background: var(--warning); color:#fff }
.standard-card { background: var(--card-bg); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow); border: 1px solid var(--card-border); }
.card-primary { border-color: var(--primary); }
.card-success { border-color: var(--success); }
.card-warning { border-color: var(--warning); }
.page-col { width: 92%; max-width: 840px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.section { margin-bottom: 24px; }
.title-text { font-size: 18px; line-height: 1.6; }
.body-text { font-size: 14px; }
@media (min-width: 1200px) { .title-text { font-size: 20px; } .body-text { font-size: 16px; } }

.content-area { overflow-y: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; background: transparent !important; }
@media (max-width: 768px) { .top-nav { height: 56px; } .nav-title { font-size: 16px; } .theme-toggle { right: 12px; width: 28px; height: 28px; } .content-area { margin-top: 56px; } }





.func-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; max-width: 720px; margin: 0 auto; }
.func-card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:16px; min-height: 96px; box-sizing: border-box; border-radius:16px; background:#e9ece5; border:1px solid #afde4d; box-shadow: inset 0 1px 2px rgba(0,0,0,0.04); transition: transform .2s ease; }
.func-card:hover { transform: translateY(-2px) }
.func-card span { font-size: 14px; color:#694d3f }

.skill-card { background:#ffffff; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); padding:16px; max-width:520px; margin:0 auto; }
.skill-row { margin-bottom: 12px }
.skill-name { font-size: 14px; color:#333 }
.skill-pct { float:right; font-size: 12px; color:#666 }
.bar { clear:both; height:10px; border-radius:9999px; background:#eef2f7; overflow:hidden; }
.bar-fill { height:100%; border-radius:9999px }
.bar-fill.teal { background: linear-gradient(90deg, var(--primary), var(--primary-dark)) }
.bar-fill.pink { background: var(--success) }
.bar-fill.cyan { background: linear-gradient(90deg, var(--primary), var(--primary-dark)) }
/* 布局与遮挡优化 */
.section { margin-bottom: 16px }
@media (max-width: 768px) { .section { margin-bottom: 14px } }
@media (min-width: 1200px) { .section { margin-bottom: 18px } }
/* 夜间模式文字适配：功能按钮与练习记录 */
.dark-mode .func-card span { color: #000 !important }
.dark-mode .practice-record, .dark-mode .practice-record * { color: #000 !important }
.dark-mode .progress-section, .dark-mode .progress-section * { color: #000 !important }
</style>
