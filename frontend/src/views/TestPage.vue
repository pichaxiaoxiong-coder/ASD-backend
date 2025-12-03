<template>
  <div class="test-page">
    <div class="test-card">
      <h1>Router 正常运行 ✅</h1>
      <p>如果你能看到这段文字，说明路由和渲染链路工作正常。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #f7fee7, #ecfdf5);
}

.test-card {
  width: 100%;
  max-width: 480px;
  padding: 32px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.18);
  text-align: center;
}

.test-card h1 {
  font-size: 1.7rem;
  color: #047857;
  margin-bottom: 12px;
}

.test-card p {
  color: #4b5563;
  line-height: 1.6;
}
</style>

