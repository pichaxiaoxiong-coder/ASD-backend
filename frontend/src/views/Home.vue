<template>
  <div class="home-page">
    <header class="home-header">
      <div>
        <p class="welcome">欢迎回来，</p>
        <h1 class="username">{{ username }}</h1>
      </div>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </header>

    <section class="home-content">
      <div class="card">
        <h2>今日概要</h2>
        <p>这里可以展示你的智能助手概要或其它信息。</p>
      </div>
      <div class="card grid">
        <div class="tile">
          <p>消息</p>
          <strong>18</strong>
        </div>
        <div class="tile">
          <p>任务</p>
          <strong>5</strong>
        </div>
        <div class="tile">
          <p>提醒</p>
          <strong>2</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('Admin')

onMounted(() => {
  console.log('✅ 这是我的业务页面！跳转成功！')
  console.log('🎯 成功！这是您亲手开发的业务页面')
  console.log('当前路由路径:', router.currentRoute.value.path)
  console.log('当前路由名称:', router.currentRoute.value.name)
  
  // 添加临时标识
  const existingTitle = document.title
  document.title = '✅ ' + existingTitle
  
  // 从 localStorage 获取用户账号
  const userAccount = localStorage.getItem('userAccount')
  if (userAccount) {
    username.value = userAccount
    console.log('用户账号:', userAccount)
  } else {
    console.warn('未找到用户账号信息')
  }
})

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userAccount')
  router.push('/login')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 40px 24px 80px;
  background: #f5f7fb;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.welcome {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 6px;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.logout-btn {
  border: none;
  padding: 10px 20px;
  border-radius: 999px;
  background: #f87171;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(248, 113, 113, 0.25);
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

.card h2 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #111827;
}

.card p {
  color: #6b7280;
  line-height: 1.5;
}

.card.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.tile {
  background: #f5f7fb;
  border-radius: 16px;
  padding: 18px;
  text-align: center;
  color: #4b5563;
}

.tile strong {
  display: block;
  margin-top: 6px;
  font-size: 1.8rem;
  color: #111827;
}

@media (max-width: 640px) {
  .home-page {
    padding: 24px 16px 60px;
  }

  .home-header {
    flex-direction: column;
    gap: 16px;
  }

  .username {
    font-size: 1.6rem;
  }
}
</style>

