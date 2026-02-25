<template>
  <view class="container">
    <view class="header" @click="handleHeaderClick">
      <view class="user-info" v-if="userStore.isLogin">
        <u-avatar size="60" :src="userStore.userInfo.avatar || 'https://via.placeholder.com/100'"></u-avatar>
        <view class="text-info">
          <text class="nickname">{{ userStore.userInfo.nickname }}</text>
          <text class="uid">UID: {{ userStore.userInfo.uid }}</text>
        </view>
      </view>
      <view class="user-info" v-else>
        <u-avatar size="60" icon="account"></u-avatar>
        <view class="text-info">
          <text class="nickname">点击登录/注册</text>
          <text class="uid">登录后享受会员权益</text>
        </view>
      </view>
      
      <view class="asset-card">
        <view class="asset-item">
          <text class="num">¥{{ userStore.isLogin ? '0.00' : '---' }}</text>
          <text class="desc">我的余额</text>
        </view>
        <view class="asset-item">
          <text class="num">{{ userStore.isLogin ? '0' : '-' }}</text>
          <text class="desc">免单卡</text>
        </view>
      </view>
    </view>

    <view class="menu-list">
      <u-cell-group :border="false">
        <u-cell icon="order" title="我的订单" isLink url="/pages/order/list" :disabled="!userStore.isLogin"></u-cell>
        <u-cell icon="share" title="邀请好友" isLink label="获得加速权益" url="/pages/share/invite" :disabled="!userStore.isLogin"></u-cell>
        <u-cell icon="grid" title="管理控制台" isLink url="/pages/admin/dashboard" v-if="userStore.isAdmin"></u-cell>
        <u-cell icon="setting" title="退出登录" isLink @click="handleLogout" v-if="userStore.isLogin"></u-cell>
      </u-cell-group>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const handleHeaderClick = () => {
  if (!userStore.isLogin) {
    uni.navigateTo({
      url: '/pages/login/login'
    })
  }
}

const handleInvite = () => {
  console.log('handleInvite called, isLogin:', userStore.isLogin)
  
  if (!userStore.isLogin) {
    console.log('User not logged in, returning')
    return
  }
  
  // Get invite code (use username as invite code for simplicity)
  const inviteCode = userStore.userInfo.username || userStore.userInfo.id
  console.log('Showing modal with inviteCode:', inviteCode)
  
  uni.showModal({
    title: '邀请好友',
    content: `您的专属邀请码: ${inviteCode}\n\n分享给好友，好友注册时填写此邀请码，您的排队位次将提前3位！`,
    confirmText: '复制邀请码',
    success: (res) => {
      if (res.confirm) {
        uni.setClipboardData({
          data: inviteCode,
          success: () => {
            uni.showToast({ title: '邀请码已复制', icon: 'success' })
          }
        })
      }
    }
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: function (res) {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出',
          icon: 'none'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $bg-color;
}

.header {
  background-color: $secondary-color;
  padding: 100rpx 40rpx 40rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  
  .text-info {
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    
    .nickname {
      color: #fff;
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .uid {
      color: rgba(255,255,255,0.6);
      font-size: 24rpx;
      margin-top: 5rpx;
      margin-bottom: 15px; // Reduced margin from 40rpx to avoid overlap or excessive space
    }
  }
}

.asset-card {
  display: flex;
  justify-content: space-around;
  
  .asset-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .num {
      color: $primary-color;
      font-size: 40rpx;
      font-weight: bold;
    }
    
    .desc {
      color: rgba(255,255,255,0.7);
      font-size: 24rpx;
      margin-top: 10rpx;
    }
  }
}

.menu-list {
  margin: 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}
</style>
