<template>
  <div
    class="min-h-screen relative overflow-hidden"
    :style="{ background: 'linear-gradient(180deg, rgb(255,252,248) 0%, rgb(250,248,245) 100%)' }"
  >
    <div class="absolute top-0 left-0 right-0 pointer-events-none" :style="cloudBackgroundStyle" />

    <div class="star-mascot absolute z-10">
      <img
        src="/images/star-mascot.png"
        alt="启明星 mascot"
        class="object-contain"
        :style="{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }"
      />
    </div>

    <div class="container mx-auto px-5 md:px-[100px] py-8 md:py-12">
      <div class="text-center title-section">
        <h1 class="text-[24px] font-semibold leading-[1.5]" :style="{ color: 'rgb(59,130,246)', marginBottom: '12px' }">
          启明星
        </h1>
        <p class="text-[18px] font-normal leading-[1.5]" :style="{ color: 'rgb(75,85,99)' }">- Agent 点亮 ASD</p>
      </div>

      <div v-if="mode === 'login'" class="flex justify-center mode-toggle gap-4">
        <button
          @click="mode = 'login'"
          class="px-6 py-2 text-[16px] font-medium rounded-lg transition-all duration-200"
          :style="{
            color: mode === 'login' ? 'rgb(59,130,246)' : 'rgb(75,85,99)',
            backgroundColor: mode === 'login' ? 'rgb(224,242,254)' : 'transparent'
          }"
        >
          登录
        </button>
      </div>

      <div class="max-w-[400px] mx-auto auth-forms">
        <LoginForm v-if="mode === 'login'" @switch-to-register="mode = 'register'" />
        <RegistrationForm v-else @switch-to-login="mode = 'login'" />
      </div>

      <div class="text-center footer-text">
        <p class="text-[14px] font-normal leading-[1.5]" :style="{ color: 'rgb(107,114,128)' }">
          启明星照亮成长路，专业康复不落幕
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LoginForm from '@/components/LoginForm.vue'
import RegistrationForm from '@/components/RegistrationForm.vue'

const mode = ref<'login' | 'register'>('login')

const cloudBackgroundStyle = computed(() => {
  const svgUrl = `url("data:image/svg+xml,%3Csvg width='120' height='80' viewBox='0 0 120 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 40 Q 25 30, 35 35 Q 45 30, 50 35 Q 55 30, 65 35 Q 75 30, 80 40 Q 75 45, 65 42 Q 55 45, 50 42 Q 45 45, 35 42 Q 25 45, 20 40 Z' fill='rgb(255,253,245)' filter='blur(10px)'/%3E%3C/svg%3E")`
  return {
    height: '33.33vh',
    opacity: 0.09,
    backgroundImage: svgUrl,
    backgroundSize: '100px 70px',
    backgroundRepeat: 'repeat',
    backgroundPosition: '0 0'
  }
})
</script>

<style scoped>
.title-section {
  margin-bottom: 32px;
}

.mode-toggle {
  margin-bottom: 32px;
}

.footer-text {
  margin-top: 40px;
}

@media (max-width: 767px) {
  .title-section {
    margin-bottom: 12px;
  }

  .mode-toggle {
    margin-bottom: 8px;
  }

  .auth-forms {
    margin-top: 0;
    padding-top: 0;
  }

  .footer-text {
    margin-top: 20px;
  }
}
</style>

