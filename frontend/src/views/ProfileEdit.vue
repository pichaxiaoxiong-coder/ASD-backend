<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-b from-[#eaf2ff] to-white">
    <div class="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-sm border-b border-gray-200">
      <div class="flex items-center gap-3 px-4 py-3">
        <button class="p-2 rounded-full hover:bg-gray-100" @click="router.back()" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <h1 class="text-lg font-bold">编辑资料</h1>
      </div>
    </div>
    <main class="flex-1 overflow-y-auto pb-24 profile-edit-content">
      <div class="mx-auto page-col px-6 py-8">
        <div class="card text-center mb-6 p-8">
          <label class="relative inline-block w-24 h-24 rounded-full overflow-hidden ring-2 ring-blue-400 cursor-pointer bg-[#FFF9F5]">
            <img v-if="avatarPreview || user?.avatar" :src="avatarPreview || user?.avatar" alt="avatar" class="w-full h-full object-cover" />
            <input type="file" accept="image/*" class="absolute inset-0 opacity-0" @change="onAvatarChange" />
          </label>
          <p class="text-sm text-[#1677FF] mt-2">点击修改头像</p>
        </div>
        <div class="card p-6 info-card" style="border-radius:12px">
          <h3 class="text-base font-semibold mb-3">个人信息</h3>
          <div class="space-y-2">
            <label class="block"><span class="block mb-1 title-label">昵称</span><input v-model="form.name" type="text" class="w-full input clean-input" /></label>
            <label class="block"><span class="block mb-1 title-label">手机号</span><input v-model="form.phone" type="tel" class="w-full input clean-input" /></label>
            <label class="block"><span class="block mb-1 title-label">生日</span><div class="field-wrapper clean-field"><input v-model="form.birthday" type="date" class="w-full input clean-input" /><svg class="field-icon" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H5V10h14v9zM7 12h5v5H7z"/></svg></div></label>
          <div class="text-sm"><span class="block mb-1">性别</span>
            <label class="mr-4 inline-flex items-center gap-1 px-2 py-1 rounded" :class="form.gender==='男' ? 'bg-[#F8E2E8] border border-[#FF8FB1]' : 'bg-[#fff0f4]'"><input type="radio" value="男" v-model="form.gender" /> 男</label>
            <label class="inline-flex items-center gap-1 px-2 py-1 rounded" :class="form.gender==='女' ? 'bg-[#F8E2E8] border border-[#FF8FB1]' : 'bg-[#fff0f4]'"><input type="radio" value="女" v-model="form.gender" /> 女</label>
          </div>
        </div>
          <div class="mt-6 flex justify-center gap-3">
            <button class="btn h-10 px-5 bg-white text-gray-700 border border-[#EEEEEE] ripple" @click="router.back()">取消</button>
            <button class="btn h-10 px-5 text-[#1677FF] ripple" style="border-radius:8px; background-image: linear-gradient(180deg, #E8F4FF, #C6E0FF)" @click="handleSave">保存</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const user = ref(userStore.user)
const avatarPreview = ref<string | null>(null)
const form = ref({ name: user.value?.name || '', phone: user.value?.phone || '', birthday: '', gender: '男' })

const onAvatarChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { avatarPreview.value = reader.result as string }
  reader.readAsDataURL(file)
}

const handleSave = async () => { await userStore.update({ name: form.value.name, phone: form.value.phone, avatar: avatarPreview.value || undefined }); router.back() }
</script>

<style scoped>
.profile-edit-content { padding-top: 60px; }
@media (max-width: 768px) { .profile-edit-content { padding-top: 56px; } }
.page-col { width: 90%; max-width: 720px; margin: 0 auto; }
@media (min-width: 1200px) { .page-col { max-width: 1140px; } }
.info-card { background: transparent; border: none; box-shadow: none; }
.clean-input { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0.5rem 0 !important; line-height: 1.5 !important; }
.clean-field { background: transparent !important; border: none !important; box-shadow: none !important; }
.title-label { font-size: 16px; font-weight: 600; }
.info-card .text-sm { line-height: 1.5; }
.info-card label + label { margin-top: 8px; }
</style>
