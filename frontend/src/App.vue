<template>
  <div :class="[(theme.darkMode ? 'dark-mode dark-theme' : 'light-mode light-theme'), (isParentMode ? 'parent-mode' : 'child-mode')]">
    <router-view v-slot="{ Component }">
      <div class="route-container">
        <transition name="crossfade">
          <keep-alive>
            <div class="page-pane">
              <component :is="Component" />
            </div>
          </keep-alive>
        </transition>
      </div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
const theme = useThemeStore()
const isParentMode = ref((sessionStorage.getItem('启明星-mode') === 'parent'))
onMounted(() => { 
  theme.load()
  try { window.addEventListener('modeChanged', (e: any) => { const m = e?.detail?.mode; if (m === 'child' || m === 'parent') isParentMode.value = (m === 'parent') }) } catch {}
})
</script>

<style scoped>
.route-container { position: relative; }
.page-pane { will-change: opacity; }
</style>
