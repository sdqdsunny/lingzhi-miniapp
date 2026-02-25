<template>
  <view class="container">
    <u-navbar title="邀请好友" :autoBack="true" :bgColor="secondaryColor" titleStyle="color: #D4AF37;"></u-navbar>
    
    <view class="content">
      <view class="invite-card">
        <text class="title">您的专属邀请码</text>
        <text class="code">{{ inviteCode }}</text>
        <text class="desc">分享给好友，好友注册时填写此邀请码</text>
        <text class="desc highlight">您的排队位次将提前 3 位！</text>
      </view>

      <u-button 
        type="primary" 
        shape="circle" 
        color="#D4AF37" 
        text="复制邀请码" 
        customStyle="margin-top: 40rpx; color: #1A1A2E; font-weight: bold;"
        @click="copyCode"
      ></u-button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const secondaryColor = '#1A1A2E'
const userStore = useUserStore()

const inviteCode = computed(() => {
  if (userStore.userInfo) {
    return userStore.userInfo.username || userStore.userInfo.id || '未登录'
  }
  return '未登录'
})

const copyCode = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({ title: '邀请码已复制', icon: 'success' })
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #F5F5F5;
}

.content {
  padding: 40rpx;
}

.invite-card {
  background: linear-gradient(135deg, #1A1A2E 0%, #2A2A4E 100%);
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
  
  .title {
    color: rgba(255,255,255,0.7);
    font-size: 28rpx;
    margin-bottom: 20rpx;
  }
  
  .code {
    color: #D4AF37;
    font-size: 64rpx;
    font-weight: bold;
    letter-spacing: 10rpx;
    margin-bottom: 30rpx;
    text-shadow: 0 2rpx 10rpx rgba(212, 175, 55, 0.3);
  }
  
  .desc {
    color: rgba(255,255,255,0.5);
    font-size: 24rpx;
    margin-top: 10rpx;
    
    &.highlight {
      color: #D4AF37;
      font-weight: bold;
    }
  }
}
</style>
