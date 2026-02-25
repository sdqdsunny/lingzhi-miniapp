```
<template>
  <view class="container">
    <u-navbar title="排队状态" :placeholder="true" :bgColor="secondaryColor" titleStyle="color: #D4AF37;"></u-navbar>
    
    <view class="content">
      <view class="rank-card">
        <text class="label">我的当前排名</text>
        <text class="rank-number">{{ queueStore.myRank || '--' }}</text>
        <text class="sub-label">预计将在 15 分钟后获得免单</text>
      </view>

      <view class="water-level">
        <view class="water-fill" :style="{ height: (queueStore.waterLevel || 0) + '%' }"></view>
        <text class="pool-text">奖金池水位: {{ queueStore.waterLevel || 0 }}%</text>
      </view>

      <u-button type="primary" shape="circle" color="#D4AF37" text="加速排队" customStyle="margin-top: 40rpx; color: #1A1A2E; font-weight: bold;"></u-button>
    </view>
  </view>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useQueueStore } from '@/store/queue';
import { useUserStore } from '@/store/user';

const secondaryColor = '#1A1A2E';
const queueStore = useQueueStore();
const userStore = useUserStore();

onMounted(() => {
    if (userStore.userInfo && userStore.userInfo.id) {
        queueStore.startPolling(userStore.userInfo.id);
    }
});

onUnmounted(() => {
    queueStore.stopPolling();
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $bg-color;
}

.content {
  padding: 30rpx;
}

.rank-card {
  background: linear-gradient(135deg, $secondary-color 0%, #2A2A4E 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
  
  .label {
    color: rgba(255,255,255,0.7);
    font-size: 28rpx;
  }
  
  .rank-number {
    color: $primary-color;
    font-size: 80rpx;
    font-weight: bold;
    margin: 20rpx 0;
    text-shadow: 0 2rpx 10rpx rgba(212, 175, 55, 0.3);
  }
  
  .sub-label {
    color: rgba(255,255,255,0.5);
    font-size: 24rpx;
  }
}

.water-level {
  margin-top: 40rpx;
  height: 300rpx;
  background-color: #fff;
  border-radius: 20rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .water-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(0deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.6) 100%);
    transition: height 1s ease;
  }
  
  .pool-text {
    z-index: 10;
    font-weight: bold;
    color: $text-main;
  }
}
</style>
