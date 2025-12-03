<template>
  <div class="w-full max-w-xl mx-auto p-4">
    <div class="flex items-center justify-between gap-3">
      <button @click="prev" class="min-w-11 min-h-11 w-11 h-11 rounded-full bg-white border border-gray-300 text-gray-700 flex items-center justify-center active:scale-95">◀</button>
      <Transition name="fade">
        <div :key="displayKey" class="text-2xl md:text-3xl font-medium" :class="isCurrent ? 'text-blue-600' : 'text-[#2C3E50]'"><span>{{ year }}年{{ String(month).padStart(2,'0') }}月</span></div>
      </Transition>
      <button @click="next" class="min-w-11 min-h-11 w-11 h-11 rounded-full bg-white border border-gray-300 text-gray-700 flex items-center justify-center active:scale-95">▶</button>
    </div>
    <div class="mt-3 flex items-center justify-center gap-3">
      <select v-model.number="year" class="min-w-11 min-h-11 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
        <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
      </select>
      <select v-model.number="month" class="min-w-11 min-h-11 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'

const props = defineProps<{ modelValue?: { year: number; month: number } }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: { year: number; month: number }): void; (e: 'change', v: { year: number; month: number }): void }>()

const yDefault = props.modelValue?.year ?? 2025
const mDefault = props.modelValue?.month ?? 12
const year = ref(yDefault)
const month = ref(mDefault)
const years = Array.from({ length: 13 }, (_, i) => 2019 + i)

const displayKey = computed(() => `${year.value}-${month.value}`)
const isCurrent = computed(() => year.value === 2025 && month.value === 12)

const setValue = (y: number, m: number) => {
  year.value = y
  month.value = m
  emit('update:modelValue', { year: y, month: m })
  emit('change', { year: y, month: m })
}

const prev = () => {
  const y = month.value === 1 ? year.value - 1 : year.value
  const m = month.value === 1 ? 12 : month.value - 1
  setValue(y, m)
}

const next = () => {
  const y = month.value === 12 ? year.value + 1 : year.value
  const m = month.value === 12 ? 1 : month.value + 1
  setValue(y, m)
}

watch([year, month], ([y, m]) => setValue(y, m))
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .2s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>

