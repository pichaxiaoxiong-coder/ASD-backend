<template>
  <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
    <div class="w-full max-w-sm rounded-xl shadow-xl" :class="timeOfDay === 'night' ? 'bg-white' : 'bg-white'" style="border:2px solid #1E40AF">
      <div class="px-5 py-4 border-b" style="border-color:#1E40AF">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl" style="color:#1E40AF">🔒</span>
            <h3 class="font-semibold" style="color:#1E40AF">家长密码验证</h3>
          </div>
          <button @click="close" class="rounded p-2 hover:bg-gray-100" aria-label="关闭">✖</button>
        </div>
      </div>
      <div class="px-5 py-4">
        <div class="text-sm mb-3 text-gray-700">请输入登录密码以进入家长模式</div>
        <div class="flex items-center gap-2 mb-4">
          <input type="password" v-model="pwd" placeholder="登录密码" class="flex-1 rounded border px-3 py-2 text-sm" style="border-color:#1E40AF" @keyup.enter="submit" />
          <button @click="submit" class="h-9 rounded-md text-sm font-semibold shadow-sm bg-[#1E40AF] text-white px-4">确认</button>
        </div>
        <div v-if="error" class="mt-1 text-red-600 text-sm">{{ error }}</div>
      </div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { verifyLoginPassword, ensureLoginPassword } from '@/lib/mode'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'close': []; 'success': [] }>()

const pwd = ref('')
const error = ref('')
const timeOfDay = ref<'day'|'night'>('day')

const close = () => emit('close')
const submit = async () => {
  error.value = ''
  const ok = await verifyLoginPassword(pwd.value)
  if (ok) {
    emit('success')
    emit('close')
    pwd.value = ''
    error.value = ''
  } else {
    error.value = '密码错误'
  }
}

onMounted(async () => { await ensureLoginPassword() })
</script>

<style scoped>
</style>
