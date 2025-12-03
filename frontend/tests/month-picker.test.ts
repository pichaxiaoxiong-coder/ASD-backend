import { mount } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'
// @ts-ignore
import MonthPicker from '../src/components/MonthPicker.vue'

describe('MonthPicker', () => {
  test('初始化为2025年12月高亮', async () => {
    const wrapper = mount(MonthPicker, { props: { modelValue: { year: 2025, month: 12 } } })
    expect(wrapper.text()).toContain('2025年12月')
    const title = wrapper.find('div.text-2xl')
    expect(title.classes()).toEqual(expect.arrayContaining(['text-blue-600']))
  })

  test('上一月跨年切换到2025年11月', async () => {
    const wrapper = mount(MonthPicker, { props: { modelValue: { year: 2025, month: 12 } } })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual({ year: 2025, month: 11 })
    expect(wrapper.text()).toContain('2025年11月')
  })

  test('下一月跨年切换到2026年01月', async () => {
    const wrapper = mount(MonthPicker, { props: { modelValue: { year: 2025, month: 12 } } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual({ year: 2026, month: 1 })
    expect(wrapper.text()).toContain('2026年01月')
  })

  test('下拉选择月份与年份', async () => {
    const wrapper = mount(MonthPicker)
    const selects = wrapper.findAll('select')
    await selects[0].setValue('2024')
    await selects[1].setValue('7')
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual({ year: 2024, month: 7 })
    expect(wrapper.text()).toContain('2024年07月')
  })
})

