import { mount } from '@vue/test-utils'
import { test, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
// @ts-ignore
import RecoveryMonitoring from '@/views/RecoveryMonitoring.vue'
// @ts-ignore
import RecoveryProgress from '@/views/RecoveryProgress.vue'
import { nextTick } from 'vue'

const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/recovery-monitoring', component: RecoveryMonitoring },
  { path: '/recovery-progress', component: RecoveryProgress },
]})

test('点击进度统计跳转到进度页', async () => {
  router.push('/recovery-monitoring'); await router.isReady()
  const pinia = createPinia()
  const wrapper = mount(RecoveryMonitoring, { global: { plugins: [router, pinia] } })
  const btn = wrapper.find('.func-card')
  await btn.trigger('click')
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  expect(router.currentRoute.value.path).toBe('/recovery-progress')
})

test('时间范围切换更新图表', async () => {
  router.push('/recovery-progress'); await router.isReady()
  const pinia = createPinia()
  const wrapper = mount(RecoveryProgress, { global: { plugins: [router, pinia] } })
  await new Promise(r => setTimeout(r, 10))
  const week = wrapper.find('.pill')
  await week.trigger('click')
  expect(week.classes()).toContain('active')
})
