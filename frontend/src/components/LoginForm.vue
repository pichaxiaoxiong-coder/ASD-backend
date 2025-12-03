<template>
  <div class="login-form-container" :style="{ display: 'flex', flexDirection: 'column' }">
    <!-- Phone number field -->
    <div class="form-field" :style="{ marginBottom: '16px' }">
      <label
        class="block text-[16px] font-medium leading-[1.5]"
        :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
      >
        手机号码
      </label>
      <div class="relative">
        <div
          class="absolute left-0 top-0 bottom-0 w-[60px] flex items-center justify-center"
          :style="{ borderRight: '1px solid rgb(229,229,229)' }"
        >
          <span class="text-[14px]" :style="{ color: 'rgb(75,85,99)' }">+86</span>
          <svg
            class="w-4 h-4 ml-1"
            :style="{ color: 'rgb(156,163,175)' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <input
          type="tel"
          v-model="phone"
          placeholder="请输入 11 位手机号码"
          maxlength="11"
          class="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
          :style="inputStyle"
          @focus="handleFocus"
          @blur="handleBlur"
          :data-field="'phone'"
        />
      </div>
    </div>

    <!-- Password field -->
    <div class="form-field" :style="{ marginBottom: '8px' }">
      <label
        class="block text-[16px] font-medium leading-[1.5]"
        :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
      >
        密码
      </label>
      <div class="relative">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="请输入 6-18 位密码（字母 + 数字组合）"
          maxlength="18"
          class="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
          :style="passwordInputStyle"
          @focus="handleFocus"
          @blur="handleBlur"
          :data-field="'password'"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-100"
          :style="{ color: 'rgb(156,163,175)' }"
        >
          <svg v-if="showPassword" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Forgot password -->
    <div class="text-left forgot-password" :style="{ marginBottom: '12px' }">
      <a
        href="#"
        class="text-[14px] underline transition-colors duration-200"
        :style="{ color: 'rgb(59,130,246)' }"
        @mouseenter="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = 'rgb(49,110,226)' }"
        @mouseleave="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = 'rgb(59,130,246)' }"
      >
        忘记密码
      </a>
    </div>

    <!-- Login button -->
    <button
      @click="handleLogin"
      :disabled="isLoading"
      class="w-full rounded-lg text-[15px] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center login-button"
      :style="{
        height: '48px',
        backgroundColor: 'rgb(59,130,246)',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
        marginBottom: '20px',
      }"
      @mousedown="handleButtonMouseDown"
      @mouseup="handleButtonMouseUp"
      @mouseleave="handleButtonMouseUp"
    >
      <div v-if="isLoading" class="flex items-center gap-1">
        <span
          class="w-1 h-1 bg-white rounded-full animate-pulse"
          :style="{ animationDelay: '0s' }"
        />
        <span
          class="w-1 h-1 bg-white rounded-full animate-pulse"
          :style="{ animationDelay: '0.2s' }"
        />
        <span
          class="w-1 h-1 bg-white rounded-full animate-pulse"
          :style="{ animationDelay: '0.4s' }"
        />
      </div>
      <span v-else>立即登录</span>
    </button>

    <!-- Social login buttons -->
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }">
      <!-- WeChat login -->
      <button
        class="w-full flex items-center px-3 rounded-lg transition-all duration-200"
        :style="{
          height: '48px',
          backgroundColor: 'rgb(243,244,246)',
          boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
        }"
        @mousedown="handleSocialButtonMouseDown"
        @mouseup="handleSocialButtonMouseUp"
        @mouseleave="handleSocialButtonMouseUp"
      >
        <div class="w-7 h-7 flex items-center justify-center">
          <svg class="w-7 h-7" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#07C160" />
            <path
              d="M10.5 11.5C10.5 10.5 11 9.5 12.5 9.5C13.5 9.5 14 10 14 11C14 12 13 12.5 12 13L11 13.5V15M11 17.5H11.01"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M16 11.5C16 10.5 16.5 9.5 18 9.5C19 9.5 19.5 10 19.5 11C19.5 12 18.5 12.5 17.5 13L16.5 13.5V15M16.5 17.5H16.51"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <span class="flex-1 text-[16px] text-center mr-7" :style="{ color: 'rgb(75,85,99)' }">
          微信登录
        </span>
      </button>

      <!-- QQ login -->
      <button
        class="w-full flex items-center px-3 rounded-lg transition-all duration-200"
        :style="{
          height: '48px',
          backgroundColor: 'rgb(243,244,246)',
          boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
        }"
        @mousedown="handleSocialButtonMouseDown"
        @mouseup="handleSocialButtonMouseUp"
        @mouseleave="handleSocialButtonMouseUp"
      >
        <div class="w-7 h-7 flex items-center justify-center">
          <svg class="w-7 h-7" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#12B7F5" />
            <path
              d="M18 10C19.5 10 20 11 20 12C20 13.5 18.5 14 17 14.5C16 15 15 15 14 16M8 14C8 12.5 9 12 10.5 12C11.5 12 12 12.5 12 13.5C12 15 10 15.5 9 16.5"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <span class="flex-1 text-[16px] text-center mr-7" :style="{ color: 'rgb(75,85,99)' }">
          QQ 登录
        </span>
      </button>
      </div>

      <!-- Register prompt -->
      <div class="text-center" style="margin-top: 12px">
        <span class="text-[14px]" style="color: #999999">
          还没有账户？
        </span>
        <button
          @click="$emit('switch-to-register')"
          class="text-[14px] underline transition-colors duration-200 cursor-pointer"
          style="
            color: #ff0000;
            background: none;
            border: none;
            padding: 0;
            min-height: auto;
          "
          @mouseenter="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = '#ff0000' }"
          @mouseleave="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = '#ff0000' }"
        >
          立即注册
        </button>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineEmits<{
  'switch-to-register': []
}>()

const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const inputStyle = computed(() => ({
  height: '48px',
  paddingTop: '14px',
  paddingBottom: '14px',
  paddingLeft: '72px',
  paddingRight: '16px',
  backgroundColor: 'rgb(255,255,255)',
  border: '1px solid rgb(229,229,229)',
  color: 'rgb(30,30,30)',
  fontSize: '16px',
  lineHeight: '1.5',
  boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
}))

const passwordInputStyle = computed(() => ({
  height: '48px',
  paddingTop: '14px',
  paddingBottom: '14px',
  paddingLeft: '16px',
  paddingRight: '48px',
  backgroundColor: 'rgb(255,255,255)',
  border: '1px solid rgb(229,229,229)',
  color: 'rgb(30,30,30)',
  fontSize: '16px',
  lineHeight: '1.5',
  boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
}))

const handleFocus = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement
  target.style.border = '1.5px solid rgb(59,130,246)'
  target.style.backgroundColor = 'rgb(250,250,255)'
}

const handleBlur = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement
  target.style.border = '1px solid rgb(229,229,229)'
  target.style.backgroundColor = 'rgb(255,255,255)'
}

const handleButtonMouseDown = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'scale(0.98)'
}

const handleButtonMouseUp = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'scale(1)'
}

const handleSocialButtonMouseDown = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'scale(0.98)'
}

const handleSocialButtonMouseUp = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'scale(1)'
}

import { useRouter } from 'vue-router'
const router = useRouter()

const handleLogin = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))
  isLoading.value = false
  try {
    // 简易登录态模拟：写入 token 与用户标识，供路由守卫与API验证
    localStorage.setItem('token', 'demo-token')
    sessionStorage.setItem('启明星-user', phone.value || 'user')
    router.push('/dashboard/child')
  } catch {}
}
</script>

<style scoped>
/* Desktop spacing - default values are in inline styles */

/* Mobile responsive spacing (max-width: 767px) */
@media (max-width: 767px) {
  .login-form-container {
    margin-top: 0;
    padding-top: 0;
  }

  .login-form-container .form-field:first-child {
    margin-top: 0;
    margin-bottom: 10px !important;
  }

  .login-form-container .form-field {
    margin-bottom: 8px !important;
  }

  .login-form-container .forgot-password {
    margin-bottom: 6px !important;
  }

  .login-form-container .login-button {
    margin-bottom: 12px !important;
  }
}
</style>
