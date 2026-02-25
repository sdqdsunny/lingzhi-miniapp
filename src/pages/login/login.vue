<template>
  <view class="container">
    <view class="header">
      <view class="title">欢迎回来</view>
      <view class="subtitle">登录您的灵芝商城账户</view>
    </view>
    
    <view class="form-area">
      <u-form :model="form" ref="uForm">
        <u-form-item prop="username" borderBottom>
          <u-input v-model="form.username" placeholder="请输入用户名/手机号" border="none"></u-input>
        </u-form-item>
        <u-form-item prop="password" borderBottom>
          <u-input v-model="form.password" type="password" placeholder="请输入密码" border="none"></u-input>
        </u-form-item>
      </u-form>
      
      <view class="btn-group">
        <u-button type="primary" text="立即登录" customStyle="margin-top: 50rpx; border-radius: 40rpx;" color="#D4AF37" @click="handleLogin"></u-button>
        <view class="register-link" @click="goToRegister">
          <text>还没有账号？去注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none'
    })
    return
  }
  
  uni.showLoading({ title: '登录中...' })
  const result = await userStore.login(form.username, form.password)
  uni.hideLoading()
  
  if (result.success) {
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    setTimeout(() => {
        // Navigate back or to home
        const pages = getCurrentPages()
        if (pages.length > 1) {
            uni.navigateBack()
        } else {
            uni.switchTab({
                url: '/pages/index/index'
            })
        }
    }, 1000)
  } else {
    uni.showToast({
      title: result.message,
      icon: 'none'
    })
  }
}

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}
</script>

<style lang="scss" scoped>
.container {
  padding: 0 40rpx;
  background-color: #fff;
  min-height: 100vh;
}

.header {
  padding-top: 100rpx;
  padding-bottom: 60rpx;
  
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #999;
  }
}

.form-area {
  margin-top: 40rpx;
}

.register-link {
  margin-top: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #D4AF37;
}
</style>
