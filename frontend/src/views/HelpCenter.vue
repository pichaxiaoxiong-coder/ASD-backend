<template>
  <div class="flex min-h-screen flex-col page-bg" style="--page-bg: #e0f3ef">
    <div ref="headerRef" class="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center gap-3 px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="router.back()" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <h1 class="text-lg font-bold">帮助中心</h1>
      </div>
    </div>
    <main :class="['flex-1 overflow-y-auto pb-24 relative z-10']" :style="{ paddingTop: headerOffset + 'px' }">
      <div ref="contentRef" class="mx-auto page-col px-6 py-8">
        <div class="card p-4" style="border-radius:12px">
          <div class="field-wrapper">
            <input class="input w-full" placeholder="搜索帮助..." />
            <svg class="field-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z"/></svg>
          </div>
        </div>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">快速联系</h3>
          <div class="grid grid-cols-3 gap-3 text-sm">
            <button class="btn h-10 px-4 ripple">客服</button>
            <button class="btn h-10 px-4 ripple">电话</button>
            <button class="btn h-10 px-4 ripple">邮件</button>
          </div>
        </section>
        <section class="card p-6 module-box" style="border-radius:12px">
          <h3 class="text-sm font-semibold mb-3">帮助资源</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <button class="btn h-10 px-4 ripple">用户手册</button>
            <button class="btn h-10 px-4 ripple">视频教程</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const headerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const headerOffset = ref(64)
const updateLayout = () => {
  const headerH = headerRef.value?.offsetHeight ?? 64
  headerOffset.value = headerH
}
onMounted(() => { nextTick(() => updateLayout()); window.addEventListener('resize', updateLayout) })
onBeforeUnmount(() => { window.removeEventListener('resize', updateLayout) })
</script>

<style scoped>
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.module-box { margin-bottom: 24px; }
</style>
