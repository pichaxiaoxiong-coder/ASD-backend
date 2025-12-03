<template>
  <div class="flex min-h-screen flex-col page-bg">
    <BackgroundDecorations :is-dark-mode="timeOfDay === 'night'" />

    <div class="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="goBack()" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="flex-1 text-center">
          <h1 class="title-text" :class="timeOfDay === 'night' ? 'text-white' : 'text-gray-800'">社交游戏</h1>
        </div>
        <button class="p-2 rounded-full hover:bg-gray-100" @click="handleRestart" aria-label="重置">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 109 9h-2a7 7 0 11-7-7V3z"/></svg>
        </button>
      </div>
    </div>

    <main class="flex-1 overflow-y-auto activities-content relative z-10">
      <div class="mx-auto page-col px-6 py-8">
        <div v-if="!gameStarted">
          <div class="mb-6 text-center">
            <p class="body-text" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-600'">通过场景练习学习社交技巧</p>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">设置</span>
            </div>
            <div class="space-y-4 p-4 bg-white/60 rounded-lg">
              <div>
                <label class="text-sm font-medium mb-2 block">年龄范围</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="age in ages" :key="age" @click="selectedAge = age"
                          :class="['px-3 py-2 rounded', selectedAge===age ? 'bg-blue-500 text-white' : 'border']">{{ age }}岁</button>
                </div>
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">难度等级</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="d in difficulties" :key="d" @click="selectedDifficulty = d"
                          :class="['px-3 py-2 rounded', selectedDifficulty===d ? 'bg-blue-500 text-white' : 'border']">{{ d }}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div class="flex items-center gap-2"><span>⭐</span><span>{{ gameScenarios.length }}个场景</span></div>
            <div class="flex items-center gap-2"><span>🏆</span><span>获得奖励</span></div>
          </div>

          <button @click="startGame" class="w-full rounded-full h-11 text-white bg-gradient-to-r from-blue-500 to-purple-600">开始游戏</button>
        </div>

        <div v-else>
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">进度</span>
              <span class="text-sm" :class="timeOfDay === 'night' ? 'text-white/70' : 'text-gray-500'">{{ currentScenario + 1 }}/{{ gameScenarios.length }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded">
              <div class="h-2 bg-blue-500 rounded" :style="{ width: progressPct + '%' }"></div>
            </div>
          </div>

          <div v-if="!current" class="rounded-2xl bg-white/80 p-8 text-center">加载中...</div>

          <div v-else class="rounded-2xl bg-white/90 p-6 shadow">
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-1 rounded bg-gray-100 text-sm">{{ current.categories[0] }}</span>
              <span class="px-2 py-1 rounded text-sm" :class="current.difficulty==='简单' ? 'bg-blue-100' : 'bg-red-100'">{{ current.difficulty }}</span>
            </div>
            <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
              <span class="inline-block align-middle" v-html="current.icon.svg"></span>
              <span>{{ current.title }}</span>
            </h3>
            <div class="text-center mb-4">
              <p class="body-text text-gray-700">{{ current.description }}</p>
            </div>

            <div class="space-y-3">
              <button v-for="opt in current.options" :key="opt.id"
                      :class="['w-full text-left p-4 rounded border', selectedAnswer===opt.id ? 'bg-blue-500 text-white' : '']"
                      @click="handleAnswerSelect(opt.id)" :disabled="showResult">
                <div class="flex items-center gap-3 w-full">
                  <span class="flex-1">{{ opt.text }}</span>
                </div>
              </button>
            </div>

            <div v-if="showResult && selectedAnswer" class="mt-4 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-800">{{ current.options.find(o => o.id===selectedAnswer)?.explanation }}</p>
            </div>

            <div class="mt-6 flex gap-3">
              <button v-if="!showResult" @click="handleSubmitAnswer" :disabled="!selectedAnswer" class="flex-1 rounded bg-blue-600 text-white h-10">提交答案</button>
              <button v-else @click="handleNextScenario" class="flex-1 rounded bg-blue-600 text-white h-10">{{ isLastScenario ? '查看结果' : '下一题' }}</button>
            </div>
          </div>

          <div class="text-center mt-6">
            <p class="text-sm" :class="timeOfDay === 'night' ? 'text-white/80' : 'text-gray-600'">当前得分: <span class="font-semibold">{{ score }}</span> / {{ currentScenario + 1 }}</p>
            <div class="mt-2 flex items-center justify-center gap-1">
              <span v-for="i in 5" :key="i" class="inline-block w-4 h-4" :style="starStyle(i, current.rating.stars)"></span>
              <span class="text-xs ml-2 text-gray-500">{{ current.rating.stars }} ★（{{ current.rating.votes }}）</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
import { socialScenarios, getScenariosByAge, getScenariosByDifficulty, type SocialScenario } from '@/lib/social-scenarios'
import BottomNav from '@/components/BottomNav.vue'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const theme = useThemeStore()
const timeOfDay = computed<'day' | 'night'>(() => (theme.darkMode ? 'night' : 'day'))
const selectedAge = ref<'3-6'|'7-10'|'11-14'>('3-6')
const selectedDifficulty = ref<'简单'|'中等'|'困难'>('简单')
const ages: Array<'3-6'|'7-10'|'11-14'> = ['3-6','7-10','11-14']
const difficulties: Array<'简单'|'中等'|'困难'> = ['简单','中等','困难']
const gameScenarios = ref<SocialScenario[]>(getScenariosByAge(selectedAge.value))
const gameStarted = ref(false)
const currentScenario = ref(0)
const selectedAnswer = ref<string | null>(null)
const showResult = ref(false)
const score = ref(0)

const current = computed(() => gameScenarios.value[currentScenario.value])
const progressPct = computed(() => gameScenarios.value.length>0 ? ((currentScenario.value+1)/gameScenarios.value.length)*100 : 0)
const isLastScenario = computed(() => currentScenario.value === gameScenarios.value.length - 1 && gameScenarios.value.length > 0)

onMounted(() => { theme.load() })

const handleAnswerSelect = (id: string) => { if (!showResult.value) selectedAnswer.value = id }
const handleSubmitAnswer = () => {
  if (!selectedAnswer.value || !current.value) return
  const opt = current.value.options.find(o => o.id===selectedAnswer.value)
  if (opt?.correct) score.value += 1
  showResult.value = true
}
const handleNextScenario = () => {
  if (currentScenario.value < gameScenarios.value.length - 1) {
    currentScenario.value += 1; selectedAnswer.value = null; showResult.value = false
  } else { gameStarted.value = false }
}
const handleRestart = () => { currentScenario.value = 0; selectedAnswer.value=null; showResult.value=false; score.value=0; gameStarted.value=false }
const startGame = () => {
  let filtered = socialScenarios
  filtered = getScenariosByAge(selectedAge.value)
  filtered = getScenariosByDifficulty(selectedDifficulty.value).filter(s => filtered.includes(s))
  if (filtered.length===0) filtered = socialScenarios
  gameScenarios.value = filtered
  gameStarted.value = true
  currentScenario.value = 0
  selectedAnswer.value = null
  showResult.value = false
  score.value = 0
}

const starStyle = (i: number, rating: number) => {
  const idx = i - 1
  const fill = rating - idx >= 1 ? 1 : rating - idx > 0 ? rating - idx : 0
  const bg = `linear-gradient(90deg, #f59e0b ${fill * 100}%, #e5e7eb ${fill * 100}%)`
  return { background: bg, WebkitMaskImage: 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat' }
}

const goBack = () => {
  const saved = sessionStorage.getItem('启明星-mode')
  const mode = saved === 'parent' ? 'parent' : 'child'
  router.push(`/social-decoder/${mode}`)
}
 
</script>

<style scoped>
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.title-text { font-size: 18px; }
.body-text { font-size: 14px; }
@media (min-width: 1200px) { .title-text { font-size: 20px; } .body-text { font-size: 16px; } }
.activities-content { padding-top: calc(var(--top-bar-height) + env(safe-area-inset-top, 0px)); padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px)); }
</style>
