<template>
  <div class="flex min-h-screen flex-col page-bg" style="--page-bg: #f1ebf7">
    <div ref="headerRef" class="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center gap-3 px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="router.back()" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <h1 class="text-lg font-bold">隐私安全</h1>
      </div>
    </div>
    <main :class="['flex-1 pb-24 privacy-security-content scroll-container relative z-10', isScrollable ? 'overflow-y-auto' : 'overflow-y-hidden']" :style="{ paddingTop: headerOffset + 'px' }">
      <div ref="contentRef" class="mx-auto page-col px-6 py-8">
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">账户安全</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" v-model="twoFA" /> 双重验证</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="bioAuth" /> 生物识别</label>
            <label class="flex items-center gap-2">
              <span>自动锁定</span>
              <select v-model="autoLock" class="select"><option value="5">5分钟</option><option value="10">10分钟</option><option value="30">30分钟</option></select>
            </label>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">隐私控制</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label class="flex items-center gap-2">
              <span>资料可见性</span>
              <select v-model="visibility" class="select"><option value="private">私密</option><option value="friends">仅好友</option><option value="public">公开</option></select>
            </label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="privacyA" /> 隐私开关 A</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="privacyB" /> 隐私开关 B</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="privacyC" /> 隐私开关 C</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="privacyD" /> 隐私开关 D</label>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">权限管理</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" v-model="permA" /> 权限开关 A</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="permB" /> 权限开关 B</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="permC" /> 权限开关 C</label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="permD" /> 权限开关 D</label>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">数据管理</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <label class="flex items-center gap-2"><span>数据保留期</span><select v-model="retention" class="select"><option value="12">1年</option><option value="24">2年</option><option value="36">3年</option></select></label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="exportEnabled" /> 数据导出</label>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3 text-red-600">危险操作</h3>
          <p class="text-xs text-red-600 mb-3">删除账户将不可恢复，请谨慎操作。</p>
          <button class="btn h-10 px-5 text-white ripple" style="background-image: linear-gradient(180deg, #ff9aa2, #ff4d4f)" @click="dangerDelete">删除账户</button>
        </section>
        <div class="text-xs text-gray-500">
          <a href="#" class="underline">隐私政策</a> · <a href="#" class="underline">服务条款</a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const twoFA = ref(false)
const bioAuth = ref(false)
const autoLock = ref('5')
const visibility = ref<'private'|'friends'|'public'>('private')
const privacyA = ref(true)
const privacyB = ref(false)
const privacyC = ref(false)
const privacyD = ref(false)
const permA = ref(true)
const permB = ref(false)
const permC = ref(false)
const permD = ref(false)
const retention = ref('12')
const exportEnabled = ref(false)
const dangerDelete = () => { alert('请联系客服处理删除流程') }

const headerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const headerOffset = ref(64)
const isScrollable = ref(true)

const updateLayout = () => {
  const headerH = headerRef.value?.offsetHeight ?? 64
  headerOffset.value = headerH
  const contentH = contentRef.value?.scrollHeight ?? 0
  const viewportH = window.innerHeight
  isScrollable.value = contentH + headerH > viewportH
}

onMounted(() => {
  nextTick(() => updateLayout())
  window.addEventListener('resize', updateLayout)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLayout)
})
</script>

<style scoped>
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.module-box { margin-bottom: 24px; }
.scroll-container { -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }
.scroll-container::-webkit-scrollbar { width: 8px; }
.scroll-container::-webkit-scrollbar-thumb { background-color: rgba(100,116,139,0.5); border-radius: 9999px; }
.scroll-container::-webkit-scrollbar-track { background: transparent; }
@supports (scrollbar-color: auto) { .scroll-container { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,0.5) transparent; } }
</style>
