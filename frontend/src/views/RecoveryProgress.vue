<template>
  <div class="progress-page" :class="timeOfDay === 'night' ? 'dark' : 'light'">
    <div class="top" :style="{ background: bgGradient }">
      <div class="month-switch">
        <button class="arrow" @click="prevMonth">◀</button>
        <div class="month-text">{{ year }}年{{ month.toString().padStart(2,'0') }}月</div>
        <button class="arrow" @click="nextMonth">▶</button>
      </div>
      <div class="range-switch">
        <button :class="['pill', range==='week' ? 'active' : '']" @click="setRange('week')">周</button>
        <button :class="['pill', range==='month' ? 'active' : '']" @click="setRange('month')">月</button>
        <button :class="['pill', range==='year' ? 'active' : '']" @click="setRange('year')">年</button>
      </div>
    </div>

    <div class="chart-wrap">
      <div v-if="loading" class="loading">加载中…</div>
      <div v-else-if="chartError" class="loading">暂无数据（{{ chartError }}）</div>
      <div v-else ref="chartEl" class="chart"></div>
    </div>

    <div class="cards">
      <div class="card">
        <div class="card-icon">⏱️</div>
        <div class="card-title">总训练时长</div>
        <div class="card-value">188分钟</div>
        <div class="card-trend up">↑18%</div>
      </div>
      <div class="card">
        <div class="card-icon">✅</div>
        <div class="card-title">平均正确率</div>
        <div class="card-value">76%</div>
        <div class="card-trend up">↑5%</div>
      </div>
      <div class="card">
        <div class="card-icon">👋</div>
        <div class="card-title">主动参与天数</div>
        <div class="card-value">22天</div>
        <div class="card-trend down">↓2天</div>
      </div>
      <div class="card">
        <div class="card-icon">⚠️</div>
        <div class="card-title">情绪爆发次数</div>
        <div class="card-value">3次</div>
        <div class="card-trend up">↓67%</div>
      </div>
    </div>

    <div class="achievements">
      <div class="ach-title"><span class="trophy">🏆</span>本周成就</div>
      <div class="badges" ref="badgesEl">
        <div class="badge done"><span class="emoji">😊</span><div class="badge-text">表情大师</div></div>
        <div class="badge done"><span class="emoji">🗣️</span><div class="badge-text">沟通之星</div></div>
        <div class="badge"><span class="emoji">🎯</span><div class="badge-text">专注达人</div></div>
        <div class="badge"><span class="emoji">🤝</span><div class="badge-text">社交先锋</div></div>
      </div>
      <div class="progress">
        <div class="progress-text">距离下一级别还需完成3次训练</div>
        <div class="bar"><div class="bar-fill" :style="{ width: progressPct + '%' }"></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const timeOfDay = ref<'day'|'night'>('day')
const year = ref(2025)
const month = ref(12)
const range = ref<'week'|'month'|'year'>('month')
const chartEl = ref<HTMLElement|null>(null)
const chartError = ref<string|null>(null)
let chart: any = null
const loading = ref(true)
const progressPct = ref(70)
const bgGradient = 'linear-gradient(180deg,#F8F9FA, #FFFFFF)'

const setRange = (r: 'week'|'month'|'year') => { range.value = r; renderChart() }
const prevMonth = () => { const m = month.value - 1; if (m < 1) { month.value = 12; year.value -= 1 } else month.value = m; renderChart() }
const nextMonth = () => { const m = month.value + 1; if (m > 12) { month.value = 1; year.value += 1 } else month.value = m; renderChart() }

const ensureEcharts = async () => {
  try {
    if ((window as any).echarts) return (window as any).echarts
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      let done = false
      const timer = setTimeout(() => { if (!done) { done = true; reject(new Error('加载超时')) } }, 5000)
      s.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
      s.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve() } }
      s.onerror = () => { if (!done) { done = true; clearTimeout(timer); reject(new Error('加载失败')) } }
      document.head.appendChild(s)
    })
    return (window as any).echarts
  } catch (e: any) {
    chartError.value = e?.message || '加载异常'
    return null
  }
}

const buildData = () => {
  const days = range.value === 'week' ? 7 : (range.value === 'month' ? 31 : 12)
  const x = Array.from({ length: days }, (_, i) => i + 1)
  const minutes = x.map(i => Math.round(10 + 40 * Math.abs(Math.sin(i))))
  const accuracy = x.map(i => Math.round(50 + 40 * Math.abs(Math.cos(i))))
  return { x, minutes, accuracy }
}

const renderChart = async () => {
  loading.value = true
  chartError.value = null
  const echarts = await ensureEcharts()
  await nextTick()
  if (!chartEl.value) { loading.value = false; return }
  if (!echarts) { loading.value = false; return }
  try {
    if (!chart) chart = echarts.init(chartEl.value)
    const { x, minutes, accuracy } = buildData()
    const axisLabelRotate = range.value === 'month' ? -45 : 0
    const showEvery = range.value === 'month' ? 5 : 1
    chart.setOption({
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut',
      grid: { left: '8%', right: '8%', top: '10%', bottom: '18%' },
      tooltip: { trigger: 'axis' },
      xAxis: [{
        type: 'category',
        data: x,
        axisLabel: { rotate: axisLabelRotate, fontSize: 16, interval: (idx: number) => idx % showEvery === 0 }
      }],
      yAxis: [
        { type: 'value', name: '分钟', nameTextStyle: { color: '#4A90E2' }, axisLine: { lineStyle: { color: '#4A90E2' } } },
        { type: 'value', name: '正确率(%)', nameTextStyle: { color: '#7ED321' }, axisLine: { lineStyle: { color: '#7ED321' } }, max: 100 }
      ],
      series: [
        { type: 'bar', name: '训练时长', data: minutes, yAxisIndex: 0, itemStyle: { color: 'rgba(74,144,226,0.8)', borderRadius: [4,4,0,0] }, barWidth: 16 },
        { type: 'line', name: '正确率', data: accuracy, yAxisIndex: 1, lineStyle: { color: '#7ED321', width: 3 }, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#7ED321' } }
      ]
    })
  } catch (e: any) {
    chartError.value = e?.message || '渲染异常'
  } finally {
    loading.value = false
  }
}

const onResize = () => { if (chart) chart.resize() }

onMounted(() => { renderChart(); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); if (chart) { chart.dispose(); chart = null } })
</script>

<style scoped>
.progress-page { min-height: 100vh; display: flex; flex-direction: column; }
.top { padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
.month-switch { display: flex; align-items: center; gap: 16px; }
.month-text { font-size: 32px; font-weight: 500; color: #2C3E50; }
.arrow { width: 36px; height: 36px; border-radius: 999px; border: 1px solid #e0e0e0; background: #fff; transition: all .3s ease; }
.arrow:hover { transform: translateY(-2px); }
.range-switch { display: flex; gap: 8px; }
.pill { padding: 8px 16px; border-radius: 999px; border: 1px solid #4A90E2; color: #4A90E2; background: #fff; transition: all .3s ease; }
.pill.active { background: #4A90E2; color: #fff; }
.chart-wrap { height: 40vh; min-height: 300px; padding: 12px 16px; }
.chart { width: 100%; height: 100%; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.loading { height: 100%; display: flex; align-items: center; justify-content: center; color: #4A90E2; }
.cards { height: 35vh; min-height: 300px; display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; padding: 0 16px; }
.card { background: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: 16px; display: flex; flex-direction: column; align-items: flex-start; min-height: 120px; }
.card { background: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: 16px; display: flex; flex-direction: column; align-items: flex-start; }
.card-icon { font-size: 36px; }
.card-title { font-size: 14px; color: #666; }
.card-value { font-size: 36px; font-weight: 700; color: #2C3E50; }
.card-trend { font-size: 24px; }
.card-trend.up { color: #7ED321 }
.card-trend.down { color: #FF9500 }
.achievements { height: 25vh; min-height: 220px; padding: 8px 16px 24px; }
.ach-title { font-size: 32px; font-weight: 500; color: #2C3E50; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.trophy { font-size: 32px; }
.badges { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; }
.badge { width: 80px; height: 80px; border-radius: 999px; border: 2px solid #BDC3C7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
.badge .emoji { font-size: 32px; color: #90959a }
.badge.done { background: #FFD700; border-color: #FFD700 }
.badge.done .emoji { color: #fff }
.badge-text { position: absolute; bottom: -18px; width: 100%; text-align: center; font-size: 12px; color: #666 }
.progress { margin-top: 16px; }
.progress-text { font-size: 14px; color: #2C3E50; margin-bottom: 8px; }
.bar { height: 12px; border-radius: 999px; background: #ECF0F1; overflow: hidden; }
.bar-fill { height: 12px; border-radius: 999px; background: #4A90E2; transition: width .3s ease; }
@media (orientation: landscape) {
  .chart-wrap { height: 46vh }
  .cards { height: 34vh }
  .achievements { height: 20vh }
}
@media (min-width: 1024px) {
  .cards { max-width: 1024px; margin: 0 auto }
  .chart-wrap { max-width: 1024px; margin: 0 auto }
  .achievements { max-width: 1024px; margin: 0 auto }
}
@media (max-width: 640px) {
  .cards { grid-template-columns: 1fr; }
}
</style>
