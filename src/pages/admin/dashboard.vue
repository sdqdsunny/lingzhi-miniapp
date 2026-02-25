<template>
  <view class="container">
    <view class="header">
      <view class="title">管理控制台</view>
      <view class="subtitle">系统运行状态概览</view>
    </view>
    
    <view class="stats-grid">
      <view class="stat-card">
        <text class="label">总用户数</text>
        <text class="value">{{ stats.totalUsers || 0 }}</text>
      </view>
      <view class="stat-card">
        <text class="label">当前排队</text>
        <text class="value">{{ stats.queueSize || 0 }}</text>
      </view>
      <view class="stat-card">
        <text class="label">总订单数</text>
        <text class="value">{{ stats.totalOrders || 0 }}</text>
      </view>
      <view class="stat-card">
        <text class="label">奖金池</text>
        <text class="value">¥{{ stats.poolAmount || '0.00' }}</text>
      </view>
    </view>
    
    <!-- Config Editor Section -->
    <view class="action-area config-section">
      <view class="section-title">加速参数配置</view>
      
      <view class="config-item">
        <text class="config-label">邀请加速（位）</text>
        <view class="config-input-row">
          <u-number-box v-model="inviteSteps" :min="1" :max="20" @change="onInviteChange"></u-number-box>
        </view>
        <text class="config-desc">被邀请人首次购买后，邀请人排名提前位数</text>
      </view>
      
      <view class="config-item">
        <text class="config-label">复购加速（位）</text>
        <view class="config-input-row">
          <u-number-box v-model="repurchaseSteps" :min="1" :max="20" @change="onRepurchaseChange"></u-number-box>
        </view>
        <text class="config-desc">老用户复购时，自己排名提前位数</text>
      </view>
      
      <u-button type="primary" text="保存配置" customStyle="margin-top: 30rpx;" color="#D4AF37" @click="saveConfig" :loading="saving"></u-button>
    </view>
    
    <view class="action-area">
      <view class="section-title">手动操作</view>
      <u-button type="warning" text="触发免单结算" customStyle="margin-top: 20rpx;" @click="triggerSettlement"></u-button>
      <view class="hint">强制触发一次免单检查，如果满足条件将自动产生免单用户。</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({})
const inviteSteps = ref(3)
const repurchaseSteps = ref(2)
const saving = ref(false)

const fetchStats = async () => {
    try {
        const res = await uniCloud.callFunction({
            name: 'lz-admin',
            data: { action: 'getStats' }
        })
        if (res.result.code === 0) {
            stats.value = res.result.data
        }
    } catch (e) {
        console.error(e)
    }
}

const fetchConfig = async () => {
    try {
        const res = await uniCloud.callFunction({
            name: 'lz-admin',
            data: { action: 'getConfig' }
        })
        if (res.result.code === 0) {
            const data = res.result.data
            if (data.invite_acceleration_steps) {
                inviteSteps.value = data.invite_acceleration_steps.value
            }
            if (data.repurchase_acceleration_steps) {
                repurchaseSteps.value = data.repurchase_acceleration_steps.value
            }
        }
    } catch (e) {
        console.error('Failed to load config:', e)
    }
}

const onInviteChange = (val) => {
    inviteSteps.value = val.value
}

const onRepurchaseChange = (val) => {
    repurchaseSteps.value = val.value
}

const saveConfig = async () => {
    saving.value = true
    try {
        await uniCloud.callFunction({
            name: 'lz-admin',
            data: { 
                action: 'updateConfig', 
                params: { key: 'invite_acceleration_steps', value: inviteSteps.value }
            }
        })
        await uniCloud.callFunction({
            name: 'lz-admin',
            data: { 
                action: 'updateConfig', 
                params: { key: 'repurchase_acceleration_steps', value: repurchaseSteps.value }
            }
        })
        uni.showToast({ title: '配置已保存', icon: 'success' })
    } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' })
    }
    saving.value = false
}

const triggerSettlement = async () => {
    try {
        uni.showLoading({ title: 'Processing...' })
        const res = await uniCloud.callFunction({
            name: 'lz-admin',
            data: { action: 'triggerSettlement' }
        })
        uni.hideLoading()
        if (res.result.result && res.result.result.code === 0) {
            uni.showToast({ title: res.result.result.msg || 'Success', icon: 'success' })
            fetchStats()
        } else {
            uni.showToast({ title: res.result.result?.msg || 'No action taken', icon: 'none' })
        }
    } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: 'Error', icon: 'none' })
    }
}

onMounted(() => {
    fetchStats()
    fetchConfig()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 40rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
  
  .subtitle {
    font-size: 26rpx;
    color: #999;
    margin-top: 10rpx;
  }
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 40rpx;
  
  .stat-card {
    width: 48%;
    background-color: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
    box-sizing: border-box;
    
    .label {
      font-size: 26rpx;
      color: #666;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .value {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      display: block;
    }
  }
}

.action-area {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    border-left: 8rpx solid #D4AF37;
    padding-left: 20rpx;
  }
  
  .hint {
    font-size: 24rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

.config-section {
  .config-item {
    margin-bottom: 30rpx;
    
    .config-label {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 15rpx;
    }
    
    .config-input-row {
      display: flex;
      align-items: center;
    }
    
    .config-desc {
      font-size: 24rpx;
      color: #999;
      margin-top: 10rpx;
      display: block;
    }
  }
}
</style>
