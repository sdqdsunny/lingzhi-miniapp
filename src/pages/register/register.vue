<template>
  <view class="container">
    <view class="header">
      <view class="title">创建账号</view>
      <view class="subtitle">注册成为灵芝会员</view>
    </view>
    
    <view class="form-area">
      <u-form :model="form" ref="uForm">
        <u-form-item prop="username" borderBottom>
          <u-input v-model="form.username" placeholder="请输入用户名" border="none"></u-input>
        </u-form-item>
        <u-form-item prop="phone" borderBottom>
            <u-input v-model="form.phone" placeholder="请输入手机号" border="none"></u-input>
        </u-form-item>
        <u-form-item prop="password" borderBottom>
          <u-input v-model="form.password" type="password" placeholder="请输入密码" border="none"></u-input>
        </u-form-item>
        <u-form-item prop="confirmPassword" borderBottom>
            <u-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" border="none"></u-input>
        </u-form-item>
        <u-form-item prop="inviteCode" borderBottom>
            <u-input v-model="form.inviteCode" placeholder="邀请码（选填）" border="none"></u-input>
        </u-form-item>
      </u-form>
      
      <view class="btn-group">
        <u-button type="primary" text="立即注册" customStyle="margin-top: 50rpx; border-radius: 40rpx;" color="#D4AF37" @click="handleRegister"></u-button>
        <view class="login-link" @click="goToLogin">
          <text>已有账号？去登录</text>
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
  phone: '',
  password: '',
  confirmPassword: '',
  inviteCode: ''
})

const handleRegister = async () => {
  if (!form.username || !form.password || !form.confirmPassword) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  if (form.password !== form.confirmPassword) {
      uni.showToast({
        title: '两次密码不一致',
        icon: 'none'
      })
      return
  }
  
  uni.showLoading({ title: '注册中...' })
  try {
      const res = await uniCloud.callFunction({
          name: 'user-center',
          data: {
              action: 'register',
              params: {
                  username: form.username,
                  password: form.password,
                  mobile: form.phone,
                  inviteCode: form.inviteCode || null
              }
          }
      })
      
      uni.hideLoading()
      if (res.result.code === 0) {
          const user = res.result.data
          // Auto login
          userStore.setUserInfo(user)
          userStore.setToken('cloud_token_' + user.id)
          
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1000)
      } else {
          uni.showToast({
            title: res.result.msg || '注册失败',
            icon: 'none'
          })
      }
  } catch (e) {
      uni.hideLoading()
      uni.showToast({
        title: '请求失败: ' + e.message,
        icon: 'none'
      })
  }
}

const goToLogin = () => {
  uni.navigateBack()
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

.login-link {
  margin-top: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #D4AF37;
}
</style>
