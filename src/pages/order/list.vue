<template>
  <view class="container">
    <u-navbar title="我的订单" :autoBack="true" :bgColor="secondaryColor" titleStyle="color: #D4AF37;"></u-navbar>
    
    <view class="content">
      <view v-if="loading" class="loading-state">
        <u-loading-icon></u-loading-icon>
        <text>加载中...</text>
      </view>
      
      <view v-else-if="orders.length === 0" class="empty-state">
        <u-empty text="暂无订单" icon="order"></u-empty>
      </view>
      
      <view v-else class="order-list">
        <view class="order-card" v-for="order in orders" :key="order.id">
          <view class="order-header">
            <text class="order-id">订单号: {{ order.id.slice(-8) }}</text>
            <text class="order-status" :class="order.status.toLowerCase()">{{ order.statusText }}</text>
          </view>
          <view class="order-body">
            <text class="order-amount">¥{{ order.amount }}</text>
            <text class="order-time">{{ order.createTime }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { getMyOrders } from '@/api/order'

const secondaryColor = '#1A1A2E'
const userStore = useUserStore()
const loading = ref(true)
const orders = ref([])

onMounted(async () => {
  if (userStore.userInfo && userStore.userInfo.id) {
    try {
      const res = await getMyOrders(userStore.userInfo.id)
      if (res.code === 0) {
        orders.value = res.data
      }
    } catch (e) {
      console.error('Failed to load orders:', e)
    }
  }
  loading.value = false
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #F5F5F5;
}

.content {
  padding: 20rpx;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .order-id {
      font-size: 26rpx;
      color: #666;
    }
    
    .order-status {
      font-size: 24rpx;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      
      &.paid {
        background: #E8F5E9;
        color: #4CAF50;
      }
      &.free {
        background: #FFF8E1;
        color: #D4AF37;
      }
      &.pending {
        background: #FFF3E0;
        color: #FF9800;
      }
    }
  }
  
  .order-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .order-amount {
      font-size: 40rpx;
      font-weight: bold;
      color: #D4AF37;
    }
    
    .order-time {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style>
