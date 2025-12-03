<template>
  <div class="registration-form-container" :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
    <!-- Tab navigation -->
    <div class="tab-navigation" :style="{ borderBottom: '1px solid rgb(229,229,229)' }">
      <div class="flex">
        <button
          @click="activeTab = 'parent'"
          class="flex-1 text-[18px] relative transition-colors duration-200"
          :style="{
            height: '48px',
            color: activeTab === 'parent' ? 'rgb(59,130,246)' : 'rgb(75,85,99)',
          }"
        >
          家长信息
          <div
            v-if="activeTab === 'parent'"
            class="absolute bottom-0 left-0 right-0 transition-all duration-300"
            :style="{ height: '2px', backgroundColor: 'rgb(59,130,246)' }"
          />
        </button>
        <button
          @click="activeTab = 'child'"
          class="flex-1 text-[18px] relative transition-colors duration-200"
          :style="{
            height: '48px',
            color: activeTab === 'child' ? 'rgb(59,130,246)' : 'rgb(75,85,99)',
          }"
        >
          儿童基本信息
          <div
            v-if="activeTab === 'child'"
            class="absolute bottom-0 left-0 right-0 transition-all duration-300"
            :style="{ height: '2px', backgroundColor: 'rgb(59,130,246)' }"
          />
        </button>
      </div>
    </div>

    <!-- Parent info tab -->
    <div
      v-if="activeTab === 'parent'"
      class="animate-in fade-in tab-content"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-out',
      }"
    >
      <!-- Parent name -->
      <div>
        <label
          class="block text-[16px] font-medium leading-[1.5]"
          :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
        >
          家长姓名
        </label>
        <input
          type="text"
          v-model="parentName"
          placeholder="请输入您的姓名"
          class="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
          :style="baseInputStyle"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </div>

      <!-- Phone and verification code -->
      <div>
        <label
          class="block text-[16px] font-medium leading-[1.5]"
          :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
        >
          手机号码
        </label>
        <div class="flex gap-2">
          <div class="relative flex-1">
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
              :style="phoneInputStyle"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </div>
          <input
            type="text"
            v-model="verificationCode"
            placeholder="验证码"
            maxlength="6"
            class="w-[120px] rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
            :style="baseInputStyle"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>
        <button
          @click="handleGetCode"
          :disabled="phone.length !== 11 || countdown > 0"
          class="mt-2 rounded-lg text-[15px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          :style="{
            width: '120px',
            height: '48px',
            backgroundColor:
              phone.length === 11 && countdown === 0
                ? 'rgb(59,130,246)'
                : countdown > 0
                  ? countdownButtonColor
                  : 'rgb(229,229,229)',
            color: phone.length === 11 || countdown > 0 ? 'white' : 'rgb(156,163,175)',
            boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
          }"
          @mousedown="handleCountdownButtonMouseDown"
          @mouseup="handleButtonMouseUp"
          @mouseleave="handleButtonMouseUp"
        >
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </div>

      <!-- Relationship -->
      <div>
        <label
          class="block text-[16px] font-medium leading-[1.5]"
          :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
        >
          亲属关系
        </label>
        <div class="relative">
          <select
            v-model="relationship"
            class="w-full rounded-lg appearance-none transition-all duration-300 ease-out focus:outline-none"
            :style="{
              ...baseInputStyle,
              paddingRight: '40px',
              color: relationship ? 'rgb(30,30,30)' : 'rgb(156,163,175)',
            }"
            @focus="handleFocus"
            @blur="handleBlur"
          >
            <option value="">请选择</option>
            <option value="father">父亲</option>
            <option value="mother">母亲</option>
            <option value="guardian">监护人</option>
          </select>
          <svg
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            :style="{ color: 'rgb(156,163,175)' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Password -->
      <div>
        <label
          class="block text-[16px] font-medium leading-[1.5]"
          :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
        >
          密码
        </label>
        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="parentPassword"
            placeholder="请输入 6-18 位密码（字母 + 数字组合）"
            maxlength="18"
            class="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
            :style="passwordInputStyle"
            @focus="handleFocus"
            @blur="handleBlur"
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

        <!-- Password strength indicator -->
        <div v-if="parentPassword" class="flex gap-2 mt-2">
          <div
            class="h-1.5 flex-1 rounded-full transition-colors duration-200"
            :style="{
              backgroundColor: passwordStrength >= 1 ? 'rgb(248,113,113)' : 'rgb(229,229,229)',
            }"
          />
          <div
            class="h-1.5 flex-1 rounded-full transition-colors duration-200"
            :style="{
              backgroundColor: passwordStrength >= 2 ? 'rgb(252,211,77)' : 'rgb(229,229,229)',
            }"
          />
          <div
            class="h-1.5 flex-1 rounded-full transition-colors duration-200"
            :style="{
              backgroundColor: passwordStrength >= 3 ? 'rgb(74,222,128)' : 'rgb(229,229,229)',
            }"
          />
        </div>
      </div>
    </div>

    <!-- Child info tab -->
    <div
      v-if="activeTab === 'child'"
      class="animate-in fade-in tab-content"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-out',
      }"
    >
      <!-- Child name -->
      <div>
        <label
          class="block text-[16px] font-medium leading-[1.5]"
          :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
        >
          儿童姓名
        </label>
        <input
          type="text"
          v-model="childName"
          placeholder="请输入孩子的姓名"
          class="w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
          :style="baseInputStyle"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </div>

      <!-- Birth date -->
      <div>
        <label
          class="block text-[16px] font-medium leading-[1.5]"
          :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
        >
          儿童出生日期
        </label>
        <input
          type="date"
          v-model="birthDate"
          class="w-[200px] rounded-lg transition-all duration-200 ease-in-out focus:outline-none"
          :style="baseInputStyle"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </div>

      <!-- ASD diagnosis -->
      <div>
        <label
          class="block text-[16px] font-medium leading-[1.5]"
          :style="{ color: 'rgb(75,85,99)', marginBottom: '8px' }"
        >
          自闭症诊断情况
        </label>
        <div class="relative">
          <select
            v-model="diagnosis"
            class="w-full rounded-lg appearance-none transition-all duration-300 ease-out focus:outline-none"
            :style="{
              ...baseInputStyle,
              paddingRight: '40px',
              color: diagnosis ? 'rgb(30,30,30)' : 'rgb(156,163,175)',
            }"
            @focus="handleFocus"
            @blur="handleBlur"
          >
            <option value="">请选择</option>
            <option value="confirmed">已确诊</option>
            <option value="unconfirmed">未确诊</option>
            <option value="evaluating">评估中</option>
          </select>
          <svg
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            :style="{ color: 'rgb(156,163,175)' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Agreement checkbox -->
    <div class="flex items-start gap-2">
      <button
        @click="agreedToTerms = !agreedToTerms"
        class="flex-shrink-0 mt-0.5 flex items-center justify-center rounded transition-all duration-100"
        :style="{
          width: '20px',
          height: '20px',
          minWidth:'20px',
          minHeight:'20px',
          flex:'none',
          borderRadius: '3px',
          border:
            showError && !agreedToTerms ? '2px solid rgb(248,113,113)' : '1px solid rgb(229,229,229)',
          backgroundColor: agreedToTerms ? 'rgba(59,130,246,0.9)' : 'rgb(255,255,255)',
        }"
      >
        <svg v-if="agreedToTerms" class="w-3 h-3" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5 L4 7 L8 3"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <p class="text-[14px] leading-relaxed" :style="{ color: 'rgb(75,85,99)' }">
        我已阅读并同意
        <a
          href="#"
          class="underline transition-colors duration-200"
          :style="{ color: 'rgb(59,130,246)' }"
          @mouseenter="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = 'rgb(49,110,226)' }"
          @mouseleave="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = 'rgb(59,130,246)' }"
        >
          《用户服务协议》
        </a>
        和
        <a
          href="#"
          class="underline transition-colors duration-200"
          :style="{ color: 'rgb(59,130,246)' }"
          @mouseenter="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = 'rgb(49,110,226)' }"
          @mouseleave="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = 'rgb(59,130,246)' }"
        >
          《隐私政策》
        </a>
      </p>
    </div>

    <!-- Error message -->
    <p
      v-if="showError && !agreedToTerms"
      class="text-[12px] animate-in fade-in duration-200"
      :style="{ color: 'rgb(248,113,113)', marginTop: '-12px' }"
    >
      请阅读并同意用户协议与隐私政策
    </p>

    <!-- Register button -->
    <button
      @click="handleRegister"
      :disabled="((activeTab === 'parent' ? !isParentValid : !isFormValid) || isLoading)"
      class="w-full rounded-lg text-[15px] font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
      :style="{
        height: '48px',
        backgroundColor: (activeTab === 'parent' ? isParentValid : isFormValid) ? 'rgb(59,130,246)' : 'rgb(229,229,229)',
        color: (activeTab === 'parent' ? isParentValid : isFormValid) ? 'white' : 'rgb(156,163,175)',
        borderRadius: '8px',
        boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
      }"
      @mousedown="handleRegisterButtonMouseDown"
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
      <span v-else>{{ activeTab === 'parent' ? '保存信息' : '立即注册' }}</span>
    </button>

    <!-- Switch to login link -->
    <div class="text-center switch-to-login">
      <span class="text-[14px]" :style="{ color: '#666666' }">已有账号？</span>
      <button
        @click="$emit('switch-to-login')"
        class="text-[14px] underline transition-colors duration-200 cursor-pointer"
        :style="{
          color: '#FF0000',
          background: 'none',
          border: 'none',
          padding: '0',
          minHeight: 'auto',
          textDecoration: 'underline',
        }"
        @mouseenter="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = '#CC0000' }"
        @mouseleave="(e) => { const target = e.target as HTMLElement; if (target) target.style.color = '#FF0000' }"
      >
        去登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineEmits<{
  'switch-to-login': []
}>()

type TabType = 'parent' | 'child'

const activeTab = ref<TabType>('parent')
const isLoading = ref(false)

// Parent info
const parentName = ref('')
const phone = ref('')
const verificationCode = ref('')
const countdown = ref(0)
const relationship = ref('')
const parentPassword = ref('')
const showPassword = ref(false)

// Child info
const childName = ref('')
const birthDate = ref('')
const diagnosis = ref('')

// Agreement
const agreedToTerms = ref(false)
const showError = ref(false)

const baseInputStyle = computed(() => ({
  height: '48px',
  paddingTop: '14px',
  paddingBottom: '14px',
  paddingLeft: '16px',
  paddingRight: '16px',
  backgroundColor: 'rgb(255,255,255)',
  border: '1px solid rgb(229,229,229)',
  color: 'rgb(30,30,30)',
  fontSize: '16px',
  lineHeight: '1.5',
  boxShadow: '0 2px 2px rgba(220,220,220,0.2)',
}))

const phoneInputStyle = computed(() => ({
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

const passwordStrength = computed(() => {
  const password = parentPassword.value
  if (password.length === 0) return 0
  if (password.length <= 3) return 1
  if (password.length <= 5) return 2
  return 3
})

const countdownButtonColor = computed(() => {
  if (countdown.value === 0) return 'rgb(59,130,246)'
  const progress = (60 - countdown.value) / 60
  const warmBlue = { r: 59, g: 130, b: 246 }
  const lightPurple = { r: 199, g: 146, b: 234 }
  const r = Math.round(warmBlue.r + (lightPurple.r - warmBlue.r) * progress)
  const g = Math.round(warmBlue.g + (lightPurple.g - warmBlue.g) * progress)
  const b = Math.round(warmBlue.b + (lightPurple.b - warmBlue.b) * progress)
  return `rgb(${r},${g},${b})`
})

const isFormValid = computed(
  () =>
    parentName.value &&
    phone.value.length === 11 &&
    verificationCode.value &&
    relationship.value &&
    parentPassword.value.length >= 6 &&
    childName.value &&
    birthDate.value &&
    diagnosis.value &&
    agreedToTerms.value
)

const isParentValid = computed(
  () =>
    parentName.value &&
    phone.value.length === 11 &&
    verificationCode.value &&
    relationship.value &&
    parentPassword.value.length >= 6 &&
    agreedToTerms.value
)

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

const handleButtonMouseUp = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'scale(1)'
}

const handleCountdownButtonMouseDown = (e: MouseEvent) => {
  if (phone.value.length === 11 && countdown.value === 0) {
    const target = e.currentTarget as HTMLElement
    target.style.transform = 'scale(0.98)'
  }
}

const handleRegisterButtonMouseDown = (e: MouseEvent) => {
  if (isFormValid.value) {
    const target = e.currentTarget as HTMLElement
    target.style.transform = 'scale(0.98)'
  }
}

const handleGetCode = () => {
  if (phone.value.length === 11) {
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }
}

const handleRegister = async () => {
  // Parent tab: save and navigate to child info page
  if (activeTab.value === 'parent') {
    if (!isParentValid.value) {
      showError.value = !agreedToTerms.value
      return
    }
    isLoading.value = true
    await new Promise((resolve) => setTimeout(resolve, 800))
    isLoading.value = false
    try {
      window.location.href = '/child-basic-info'
    } catch {}
    return
  }

  // Child tab: original register flow
  if (!agreedToTerms.value) {
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 2000)
    return
  }
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))
  isLoading.value = false
}
</script>

<style scoped>
/* Desktop spacing */
.switch-to-login {
  margin-top: 12px;
}

/* Mobile responsive spacing (max-width: 767px) */
@media (max-width: 767px) {
  .registration-form-container {
    gap: 16px !important;
  }

  .registration-form-container .tab-navigation {
    margin-bottom: 8px;
  }

  .registration-form-container .tab-content {
    gap: 16px !important;
  }

  .registration-form-container .switch-to-login {
    margin-top: 12px !important;
  }
}
</style>
