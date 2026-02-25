<template>
  <view class="container">
    <u-navbar title="确认订单" :autoBack="true" :bgColor="secondaryColor" titleStyle="color: #D4AF37;"></u-navbar>
    
    <view class="content">
      <!-- Address Card -->
      <view class="card address-card">
        <view class="section-header">
          <u-icon name="map" color="#D4AF37" size="24"></u-icon>
          <text class="title">收货地址</text>
        </view>
        <view class="address-info">
          <text class="name">郭大侠 13800000000</text>
          <text class="detail">北京市朝阳区灵芝大厦888号</text>
        </view>
        <u-icon name="arrow-right" color="#999"></u-icon>
      </view>

      <!-- Product Card -->
      <view class="card product-card">
        <image class="img" src="https://via.placeholder.com/150" mode="aspectFill"></image>
        <view class="info">
          <text class="name">极品灵芝孢子粉</text>
          <text class="sku">规格: 礼盒装 (500g)</text>
          <view class="price-row">
            <text class="price">¥299.00</text>
            <text class="count">x1</text>
          </view>
        </view>
      </view>

      <!-- Amount Summary -->
      <view class="card summary-card">
        <view class="row">
          <text>商品金额</text>
          <text>¥299.00</text>
        </view>
        <view class="row">
          <text>运费</text>
          <text>¥0.00</text>
        </view>
        <u-divider></u-divider>
        <view class="row total">
          <text>合计</text>
          <text class="total-price">¥299.00</text>
        </view>
      </view>
    </view>

    <!-- Bottom Bar -->
    <view class="bottom-bar">
      <view class="left">
        <text>实付:</text>
        <text class="price">¥299.00</text>
      </view>
      <u-button 
        text="立即支付" 
        color="#D4AF37" 
        customStyle="color: #1A1A2E; font-weight: bold; width: 240rpx;"
        @click="handlePay"
      ></u-button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { useOrderStore } from '@/store/order';
import { useUserStore } from '@/store/user';

const secondaryColor = '#1A1A2E';
const orderStore = useOrderStore();
const userStore = useUserStore();

const handlePay = async () => {
    // Mock Payment Flow
    uni.showLoading({ title: '正在支付...' });
    
    try {
        if (!userStore.userInfo || !userStore.userInfo.id) {
             uni.hideLoading();
             uni.showToast({ title: '请先登录', icon: 'none' });
             setTimeout(() => {
                 uni.navigateTo({ url: '/pages/login/login' });
             }, 1500);
             return;
        }

        // 2. Create Order (UniCloud)
        const res = await orderStore.create({
            userId: userStore.userInfo.id,
            productId: '1', // Mock Product ID (String for DB)
            address: "北京市朝阳区灵芝大厦",
            amount: 299.00
        });

        // 3. Call Pay API (UniCloud)
        if (res.code === 0 && res.data && res.data.orderId) {
            const payRes = await orderStore.pay(res.data.orderId);
            if (payRes.code === 0) {
                 // 4. Simulate UI Success
                setTimeout(() => {
                    uni.hideLoading();
                    uni.showToast({ title: '支付成功', icon: 'success' });
                    
                    // Redirect to Queue
                    setTimeout(() => {
                        uni.switchTab({ url: '/pages/queue/queue' });
                    }, 1000);
                }, 1000);
            } else {
                 throw new Error(payRes.message);
            }
        } else {
             throw new Error(res.message || '订单创建失败');
        }
        
    } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '支付失败: ' + (e.message || 'Unknown'), icon: 'none' });
    }
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 120rpx;
}

.content {
  padding: 30rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.03);
}

.address-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
  }
  
  .address-info {
    flex: 1;
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    
    .name {
      font-weight: bold;
      font-size: 30rpx;
    }
    
    .detail {
      color: $text-light;
      font-size: 26rpx;
      margin-top: 8rpx;
    }
  }
}

.product-card {
  display: flex;
  
  .img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
    background: #f0f0f0;
  }
  
  .info {
    flex: 1;
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .name {
      font-size: 28rpx;
      font-weight: bold;
    }
    
    .sku {
      font-size: 24rpx;
      color: $text-light;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      
      .price {
        color: #E02020;
        font-weight: bold;
        font-size: 32rpx;
      }
    }
  }
}

.summary-card {
  .row {
    display: flex;
    justify-content: space-between;
    font-size: 28rpx;
    margin-bottom: 15rpx;
    
    &.total {
       margin-top: 20rpx;
       align-items: center;
       
       .total-price {
         color: #E02020;
         font-size: 36rpx;
         font-weight: bold;
       }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 10rpx rgba(0,0,0,0.05);
  z-index: 100;
  
  .left {
    display: flex;
    align-items: baseline;
    
    .price {
      color: #E02020;
      font-size: 40rpx;
      font-weight: bold;
      margin-left: 10rpx;
    }
  }
}
</style>
