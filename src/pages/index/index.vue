<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <view style="margin-top: 24rpx;">
      <button @click="callChat">對話測試</button>
      <button style="margin-left: 16rpx;" @click="addLog">新增日誌</button>
      <button style="margin-left: 16rpx;" @click="loadLogs">拉取日誌</button>
    </view>
    <view style="margin-top: 24rpx; padding: 16rpx; width: 80%; border: 1px solid #eee;">
      <text>AI 回覆：{{ reply }}</text>
    </view>
    <view style="margin-top: 16rpx; padding: 16rpx; width: 80%; border: 1px solid #eee;">
      <text>日誌（{{ logs.length }}）</text>
      <view v-for="(it, idx) in logs" :key="idx" style="margin-top: 8rpx;">
        <text>{{ it.time }} - {{ it.user_id }} - {{ it.note }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config.js'
export default {
  data() {
    return {
      title: 'Hello',
      baseURL: API_BASE_URL,
      userId: 'u1',
      reply: '',
      logs: [],
    }
  },
  onLoad() {},
  methods: {
    callChat() {
      uni.request({
        url: `${this.baseURL}/companion/chat`,
        method: 'POST',
        data: { user_id: this.userId, message: 'hello from uni-app' },
        success: ({ data }) => {
          this.reply = data && data.reply ? data.reply : JSON.stringify(data)
        },
        fail: (err) => {
          this.reply = `錯誤：${err && err.errMsg ? err.errMsg : '請檢查後端是否啟動'}`
        }
      })
    },
    addLog() {
      uni.request({
        url: `${this.baseURL}/progress/log`,
        method: 'POST',
        data: { user_id: this.userId, note: 'clicked addLog' },
        success: () => {
          this.loadLogs()
        }
      })
    },
    loadLogs() {
      uni.request({
        url: `${this.baseURL}/progress/logs`,
        method: 'GET',
        success: ({ data }) => {
          this.logs = Array.isArray(data) ? data : []
        }
      })
    }
  },
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
