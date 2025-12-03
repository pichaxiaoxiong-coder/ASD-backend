<template>
  <div class="app-settings-page flex min-h-screen flex-col relative" :class="timeOfDay === 'night' ? 'bg-night' : 'bg-day'">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />
    <div class="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="router.back()" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="flex-1 text-center">
          <h1 class="title-text" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">账户设置</h1>
        </div>
        <div class="flex items-center gap-2">
          <button @click="onModeClick" class="h-8 px-3 rounded-md text-white text-sm font-medium" :class="mode === 'child' ? 'bg-[#1E40AF]' : 'bg-green-600'">
            当前模式：{{ mode === 'child' ? '儿童' : '家长' }}
          </button>
          <button @click="toggleNight" class="w-8 h-8 rounded-full flex items-center justify-center" :class="timeOfDay === 'night' ? 'bg-yellow-400' : 'bg-indigo-600'" aria-label="夜间模式">
            <span class="text-white text-sm">{{ timeOfDay === 'night' ? '☀' : '☾' }}</span>
          </button>
        </div>
      </div>
    </div>

    <main class="settings-content relative z-10">
      <div class="mx-auto page-col px-6 py-8">
        <section v-if="false" class="section grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="rounded-xl shadow-sm p-6 bg-white" style="border:1.5px solid #1E40AF">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">⏰</span><h3 class="font-semibold" style="color:#1E40AF">每日使用限制</h3></div>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="autoLock" @change="onAutoLockChange" /> 自动锁定</label>
            </div>
            <div class="mb-4">
              <input type="range" min="30" max="120" step="30" v-model.number="usageLimit" @change="onUsageLimitChange" class="w-full" />
              <div class="mt-2 text-sm">限制：{{ usageLimit }} 分钟</div>
            </div>
            <div>
              <div class="flex items-center justify-between text-sm mb-2"><span>今日使用</span><span>{{ usageToday }} / {{ usageLimit }} 分钟</span></div>
              <div class="h-3 w-full rounded-full overflow-hidden bg-gray-200">
                <div class="h-3" :class="usagePercent <= 100 ? 'bg-[#10B981]' : 'bg-red-500'" :style="{ width: Math.min(usagePercent, 100) + '%' }"></div>
              </div>
              <div class="mt-3 flex gap-2">
                <button @click="addUsage(5)" class="rounded bg-[#1E40AF] text-white h-9 px-3">+5分钟</button>
                <button @click="resetUsage" class="rounded bg-gray-200 text-gray-800 h-9 px-3">重置</button>
              </div>
            </div>
          </div>

          <div class="rounded-xl shadow-sm p-6 bg-white" style="border:1.5px solid #1E40AF">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">🚫</span><h3 class="font-semibold" style="color:#1E40AF">内容过滤</h3></div></div>
            <div class="grid grid-cols-1 gap-4">
              <label class="flex items-center gap-2 text-sm"><span>难度</span>
                <select v-model="difficulty" @change="onDifficultyChange" class="rounded border px-2 py-1 text-sm">
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </label>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="blockConflict" @change="onBlockConflictChange" /> 主题屏蔽：冲突场景</label>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="blockIntense" @change="onBlockIntenseChange" /> 主题屏蔽：强烈情绪</label>
              <div>
                <div class="text-sm mb-1">关键词黑名单</div>
                <input v-model="blacklistText" @blur="onBlacklistSave" placeholder="用逗号分隔，如：打架,尖叫" class="w-full rounded border px-3 py-2 text-sm" />
                <div class="text-xs mt-1 text-gray-600">当前：{{ blacklist.join('，') || '无' }}</div>
              </div>
            </div>
          </div>

          <div class="rounded-xl shadow-sm p-6 bg-white md:col-span-2" style="border:1.5px solid #1E40AF">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">📊</span><h3 class="font-semibold" style="color:#1E40AF">成长数据看板</h3></div>
              <a href="/recovery-monitoring" class="text-[#1E40AF] underline text-sm">查看详情</a>
            </div>
            <div class="mb-4 chart-wrap">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" width="100%" :height="chartHeight" preserveAspectRatio="none">
                <polyline :points="chartPoints" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle v-for="p in chartDots" :key="p.x" :cx="p.x" :cy="p.y" r="2.5" fill="#10B981" />
              </svg>
            </div>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="rounded-lg p-3" style="background:#F0F7FF"><div class="text-sm text-gray-600">情绪均值(7天)</div><div class="text-2xl font-bold" style="color:#1E40AF">{{ avgTrend }}</div></div>
              <div class="rounded-lg p-3" style="background:#F0FFF7"><div class="text-sm text-gray-600">今日任务</div><div class="text-2xl font-bold text-[#10B981]">{{ todayTasks }}</div></div>
              <div class="rounded-lg p-3" style="background:#FFF5F5"><div class="text-sm text-gray-600">提醒已设</div><div class="text-2xl font-bold text-red-500">{{ rehabReminder ? '是' : '否' }}</div></div>
            </div>
          </div>

          <div class="rounded-xl shadow-sm p-6 bg-white md:col-span-2" style="border:1.5px solid #1E40AF">
            <div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="text-3xl" style="color:#1E40AF">📋</span><h3 class="font-semibold" style="color:#1E40AF">康复训练计划</h3></div></div>
            <div class="flex items-center gap-6">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#E5E7EB" stroke-width="8" fill="none" />
                <circle :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" cx="60" cy="60" r="52" stroke="#10B981" stroke-width="8" fill="none" transform="rotate(-90 60 60)" />
                <text x="60" y="64" text-anchor="middle" font-size="20" fill="#1E40AF">{{ rehabProgress }}%</text>
              </svg>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <label class="flex items-center gap-2 text-sm"><span>进度</span><input type="range" min="0" max="100" v-model.number="rehabProgress" @change="onRehabProgressChange" /></label>
                </div>
                <div class="flex items-center gap-3">
                  <button @click="exportPDF" class="rounded bg-[#1E40AF] text-white h-9 px-3">PDF导出</button>
                  <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="rehabReminder" @change="onRehabReminderChange" /> 提醒设置</label>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- 外观设置 -->
        <section class="section card p-6" style="border-radius:12px">
          <h3 class="title-text font-semibold mb-4">外观设置</h3>
          <div class="flex items-center gap-3 mb-3 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" :checked="theme.darkMode" @change="toggleNight" /> 夜间模式</label>
            <label class="flex items-center gap-2">
              <span>字体大小</span>
              <select v-model="fontSize" class="select"><option value="small">小</option><option value="medium">中</option><option value="large">大</option></select>
            </label>
          </div>
          <div class="mt-2"><button class="btn h-10 px-4 text-[#1677FF] ripple" style="background-image: linear-gradient(180deg, #E8F4FF, #C6E0FF)">保存</button></div>
        </section>

        <!-- 声音与触觉 -->
        <section class="section card p-6" style="border-radius:12px">
          <h3 class="title-text font-semibold mb-4">声音设置</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" v-model="soundEffect" /> 声音效果</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="vibration" /> 振动反馈</label>
          </div>
          <div class="mt-2"><button class="btn h-10 px-4 text-[#1677FF] ripple" style="background-image: linear-gradient(180deg, #E8F4FF, #C6E0FF)">保存</button></div>
        </section>

        <!-- 网络设置 -->
        <section class="section card p-6" style="border-radius:12px">
          <h3 class="title-text font-semibold mb-4">网络设置</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label class="flex items-center gap-2">
              <span>数据使用</span>
              <select v-model="dataUsage" class="select"><option value="wifi">仅WiFi</option><option value="wifi-cell">WiFi与蜂窝</option></select>
            </label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="autoUpdate" /> 自动更新</label>
          </div>
          <div class="mt-2"><button class="btn h-10 px-4 text-[#1677FF] ripple" style="background-image: linear-gradient(180deg, #E8F4FF, #C6E0FF)">保存</button></div>
        </section>

        <!-- 语言设置 -->
        <section class="section card p-6" style="border-radius:12px">
          <h3 class="title-text font-semibold mb-4">语言设置</h3>
          <div class="text-sm"><select v-model="uiLang" class="select"><option value="zh-CN">简体中文</option><option value="en">English</option></select></div>
          <div class="mt-2"><button class="btn h-10 px-4 text-[#1677FF] ripple" style="background-image: linear-gradient(180deg, #E8F4FF, #C6E0FF)">保存</button></div>
        </section>

        <!-- 通知偏好设置 -->
        <section class="section rounded-2xl p-6" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <h3 class="title-text font-semibold mb-4">通知偏好</h3>
          <div class="flex items-center gap-3 mb-3">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="settings.notifications.enabled" /> 启用通知</label>
            <select v-model="settings.notifications.frequency" class="rounded border px-2 py-1 text-sm">
              <option value="off">关闭</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
            </select>
          </div>
          <div class="grid grid-cols-3 gap-3 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" v-model="settings.notifications.channels.app" /> 应用内通知</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="settings.notifications.channels.email" /> 邮件</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="settings.notifications.channels.sms" /> 短信</label>
          </div>
          <div class="mt-4 flex gap-3">
            <button @click="saveSettings" class="rounded bg-blue-600 text-white h-10 px-4">保存</button>
            <span v-if="saveMsg" class="text-sm" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-600'">{{ saveMsg }}</span>
          </div>
        </section>

        <!-- 隐私设置 -->
        <section class="section rounded-2xl p-6" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <h3 class="title-text font-semibold mb-4">隐私设置</h3>
          <div class="flex items-center gap-2 text-sm mb-3">
            <label class="flex items-center gap-2"><input type="checkbox" v-model="settings.privacy.dataSharing" /> 允许数据分享</label>
          </div>
          <div class="text-sm mb-3">
            <label class="block mb-1">资料可见性</label>
            <select v-model="settings.privacy.visibility" class="rounded border px-2 py-1">
              <option value="public">公开</option>
              <option value="friends">仅好友</option>
              <option value="private">仅自己</option>
            </select>
          </div>
          <div class="mt-2 text-xs" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">更改将影响平台端 API 的访问权限</div>
          <div class="mt-4"><button @click="saveSettings" class="rounded bg-blue-600 text-white h-10 px-4">保存</button></div>
        </section>

        <!-- 学习报告下载 -->
        <section class="section rounded-2xl p-6" :class="timeOfDay === 'night' ? 'bg-gray-700/60 text-white' : 'bg-white/70'">
          <h3 class="title-text font-semibold mb-4">学习报告</h3>
          <div class="flex items-center gap-3 text-sm mb-4">
            <label>格式</label>
            <select v-model="reportFormat" class="rounded border px-2 py-1">
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button @click="generateReport" class="rounded bg-blue-600 text-white h-10 px-4">生成</button>
          </div>
          <div class="text-sm mb-2" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-700'">下载历史</div>
          <div class="space-y-2">
            <div v-for="r in settings.reports" :key="r.id" class="flex items-center justify-between text-sm">
              <div>{{ new Date(r.createdAt).toLocaleString() }} · {{ r.title }} · {{ r.format.toUpperCase() }}</div>
              <div class="flex gap-2">
                <button @click="downloadReport(r)" class="rounded bg-gray-200 text-gray-800 h-8 px-3">下载</button>
                <button @click="removeReport(r.id)" class="rounded bg-red-500 text-white h-8 px-3">删除</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <PinModal :open="showPin" @close="showPin=false" @success="onPinSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import { useSettingsStore } from '@/stores/settings'
import { useThemeStore } from '@/stores/theme'
import PinModal from '@/components/PinModal.vue'
import { getMode, setMode, getUsageLimit, setUsageLimit, getUsageToday, setUsageToday, getAutoLock, setAutoLock, getDifficulty, setDifficulty, getBlockConflict, setBlockConflict, getBlockIntense, setBlockIntense, getBlacklist, setBlacklist, getEmotionTrend, getRehabProgress, setRehabProgress, getRehabReminder, setRehabReminder } from '@/lib/mode'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const timeOfDay = ref<'day' | 'night'>('day')
const theme = useThemeStore()
const userStore = useUserStore()
const toggleNight = () => { theme.toggle(); timeOfDay.value = theme.darkMode ? 'night' : 'day' }

const mode = ref<'child'|'parent'>(getMode())
const showPin = ref(false)
const onModeClick = () => { if (mode.value === 'child') showPin.value = true; else { mode.value = 'child'; setMode('child'); userStore.update({ mode: 'child' }); try { window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: 'child' } })) } catch {} } }
const onPinSuccess = () => { mode.value = 'parent'; setMode('parent'); userStore.update({ mode: 'parent' }); try { window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: 'parent' } })) } catch {}; try { router.push('/parent-dashboard') } catch {} }

const fontSize = ref<'small'|'medium'|'large'>('medium')
const soundEffect = ref(true)
const vibration = ref(true)
const dataUsage = ref<'wifi'|'wifi-cell'>('wifi')
const autoUpdate = ref(false)
const uiLang = ref<'zh-CN'|'en'>('zh-CN')

const settings = useSettingsStore()
const saveMsg = ref('')
const reportFormat = ref<'pdf'|'csv'|'json'>('pdf')

const saveSettings = () => { settings.save(); saveMsg.value = '已保存'; setTimeout(() => saveMsg.value = '', 1500) }
const generateReport = () => {
  const id = Date.now().toString()
  const record = { id, createdAt: Date.now(), format: reportFormat.value, title: '学习报告' }
  settings.upsertReport(record)
}
const removeReport = (id: string) => settings.removeReport(id)

const downloadReport = (r: { id: string; format: 'pdf'|'csv'|'json'; title: string }) => {
  const blob = new Blob([JSON.stringify({ id: r.id, title: r.title, format: r.format, prefs: settings.$state })], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${r.title}-${r.id}.${r.format}`; a.click(); URL.revokeObjectURL(url)
}

onMounted(() => { settings.load(); theme.load(); timeOfDay.value = theme.darkMode ? 'night' : 'day'; try { window.addEventListener('modeChanged', (e: any) => { const m = e?.detail?.mode; if (m === 'child' || m === 'parent') mode.value = m }) } catch {} })

const usageLimit = ref<number>(getUsageLimit())
const usageToday = ref<number>(getUsageToday())
const autoLock = ref<boolean>(getAutoLock())
const onUsageLimitChange = () => setUsageLimit(usageLimit.value)
const addUsage = (m: number) => { const next = usageToday.value + m; usageToday.value = next; setUsageToday(next) }
const resetUsage = () => { usageToday.value = 0; setUsageToday(0) }
const onAutoLockChange = () => setAutoLock(autoLock.value)
const usagePercent = computed(() => Math.round((usageToday.value / usageLimit.value) * 100))

const difficulty = ref(getDifficulty())
const blockConflict = ref(getBlockConflict())
const blockIntense = ref(getBlockIntense())
const blacklist = ref<string[]>(getBlacklist())
const blacklistText = ref(blacklist.value.join(','))
const onDifficultyChange = () => setDifficulty(difficulty.value)
const onBlockConflictChange = () => setBlockConflict(blockConflict.value)
const onBlockIntenseChange = () => setBlockIntense(blockIntense.value)
const onBlacklistSave = () => { const arr = blacklistText.value.split(',').map(s => s.trim()).filter(Boolean); blacklist.value = arr; setBlacklist(arr) }

const trend = ref<number[]>(getEmotionTrend())
const chartWidth = 600
const chartHeight = 80
const chartPadding = 10
const chartPoints = computed(() => {
  const n = trend.value.length
  const stepX = (chartWidth - chartPadding * 2) / (n - 1)
  const maxY = 100
  const minY = 0
  return trend.value.map((v, i) => {
    const x = chartPadding + i * stepX
    const y = chartPadding + (chartHeight - chartPadding * 2) * (1 - (v - minY) / (maxY - minY))
    return `${x},${y}`
  }).join(' ')
})
const chartDots = computed(() => {
  const n = trend.value.length
  const stepX = (chartWidth - chartPadding * 2) / (n - 1)
  return trend.value.map((v, i) => {
    const x = chartPadding + i * stepX
    const y = chartPadding + (chartHeight - chartPadding * 2) * (1 - v / 100)
    return { x, y }
  })
})
const avgTrend = computed(() => Math.round(trend.value.reduce((a, b) => a + b, 0) / trend.value.length))
const todayTasks = ref<number>(3)

const rehabProgress = ref<number>(getRehabProgress())
const rehabReminder = ref<boolean>(getRehabReminder())
const onRehabProgressChange = () => setRehabProgress(rehabProgress.value)
const onRehabReminderChange = () => setRehabReminder(rehabReminder.value)
const circumference = 2 * Math.PI * 52
const dashOffset = computed(() => circumference * (1 - rehabProgress.value / 100))

const exportPDF = () => {
  const content = `康复训练计划\n进度: ${rehabProgress.value}%\n提醒: ${rehabReminder.value ? '开启' : '关闭'}`
  const blob = new Blob([content], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rehab-plan-${Date.now()}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.app-settings-page { --top-bar-height: 64px; }
.settings-content { padding-top: var(--top-bar-height); padding-bottom: 96px; overflow-y: auto; max-height: calc(100vh - var(--top-bar-height)); }
.app-settings-page .page-col, .app-settings-page .section, .app-settings-page .card { position: relative; z-index: 10; }
.app-settings-page .header { z-index: 50; }
.app-settings-page :global(.BackgroundDecorations) { z-index: 0; }
.dark-mode .app-settings-page .section, .dark-mode .app-settings-page .card { z-index: 10; }
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.chart-wrap { width: 100%; overflow: hidden; }
.chart-wrap svg { display: block; width: 100%; height: auto; }
.section { margin-bottom: 24px; }
.title-text { font-size: 18px; }
.body-text { font-size: 14px; }
@media (min-width: 1200px) { .title-text { font-size: 20px; } .body-text { font-size: 16px; } }
</style>
