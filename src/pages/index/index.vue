<template>
  <view class="container">
    <!-- Announcement Board (Replaces Swiper) -->
    <view class="announcement-board" v-if="announcement">
      <view class="board-header">
        <u-icon name="volume-fill" color="#D4AF37" size="20"></u-icon>
        <text class="board-title">品牌故事</text>
      </view>
      <text class="board-content">{{ announcement }}</text>
    </view>
    
    <view class="section-title">
      <text class="title">热门臻选</text>
      <text class="subtitle">Premium Selection</text>
    </view>
    
    <view class="product-grid">
      <view class="product-card" v-for="product in products" :key="product.id" @click="goDetail(product)">
        <image class="product-img" :src="product.image" mode="aspectFill"></image>
        <view class="info">
          <text class="name">{{ product.name }}</text>
          <view class="price-row">
            <text class="price">¥{{ product.price }}</text>
            <text class="sold">{{ product.sold }}</text>
          </view>
          <view class="tag">
            <text>{{ product.tag }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProductList } from '@/api/product';

const announcement = ref('');

// Products with fallback mock data
const products = ref([]);

const mockProducts = [
    { 
        id: 1, 
        image: 'https://placehold.co/600x600/1A1A2E/D4AF37/png?text=Luxury+Gift+Box', 
        name: '极品灵芝孢子粉 (礼盒)', 
        price: 375, 
        sold: '已售 1000+',
        tag: '免单专享商品'
    },
    { 
        id: 2, 
        image: 'https://placehold.co/600x600/654321/F5F5DC/png?text=Spore+Powder', 
        name: '野生原木灵芝 (特级)', 
        price: 375, 
        sold: '已售 500+',
        tag: '免单专享商品'
    },
    { 
        id: 3, 
        image: 'https://placehold.co/600x600/0A320A/228B22/png?text=Wild+Forest', 
        name: '破壁灵芝粉 (罐装)', 
        price: 375, 
        sold: '已售 2000+',
        tag: '免单专享商品'
    },
    { 
        id: 4, 
        image: 'https://placehold.co/600x600/8B0000/FFBF00/png?text=Lingzhi+Tea', 
        name: '灵芝切片 (超值装)', 
        price: 375, 
        sold: '已售 3000+',
        tag: '免单专享商品'
    }
];

onMounted(async () => {
    // Fetch products from database
    try {
        const res = await getProductList();
        if (res.code === 0 && res.data.length > 0) {
            products.value = res.data.map(p => ({
                ...p,
                sold: p.sold || '热销中',
                tag: p.tag || '免单专享商品'
            }));
        } else {
            // Fallback to mock data
            products.value = mockProducts;
        }
    } catch (e) {
        console.log('Using mock products:', e.message);
        products.value = mockProducts;
    }

    announcement.value = "灵芝商城 —— 传承千年养生智慧，采用长白山野生原木灵芝。";
});

const goDetail = (product) => {
    uni.navigateTo({
        url: `/pages/order/confirm?productId=${product.id}&price=${product.price}&name=${encodeURIComponent(product.name)}`
    });
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 20rpx;
}

.announcement-board {
  margin: 30rpx;
  padding: 40rpx;
  background: white; // Or a subtle texture
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(212, 175, 55, 0.15); // Golden shadow
  border: 1rpx solid rgba(212, 175, 55, 0.3);
  
  .board-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .board-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #D4AF37;
      margin-left: 10rpx;
    }
  }
  
  .board-content {
    font-size: 28rpx;
    color: #4A4A4A;
    line-height: 1.6;
    white-space: pre-wrap; // Allow newlines
  }
}

.section-title {
  padding: 0 30rpx 30rpx 30rpx;
  display: flex;
  align-items: baseline;
  
  .title {
    font-size: 34rpx;
    font-weight: bold;
    color: $text-main;
    margin-right: 15rpx;
  }
  
  .subtitle {
    font-size: 24rpx;
    color: $primary-color;
    letter-spacing: 2rpx;
    text-transform: uppercase;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 0 20rpx;
}

.product-card {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.05);
  
  .product-img {
    width: 100%;
    height: 300rpx;
  }
  
  .info {
    padding: 20rpx;
    
    .name {
      font-size: 28rpx;
      color: $text-main;
      margin-bottom: 15rpx;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;
      
      .price {
        color: #E02020;
        font-weight: bold;
        font-size: 32rpx;
      }
      
      .sold {
        color: $text-light;
        font-size: 22rpx;
      }
    }
    
    .tag {
      background-color: rgba(212, 175, 55, 0.1);
      padding: 4rpx 10rpx;
      border-radius: 4rpx;
      display: inline-block;
      
      text {
        color: $primary-color; // Gold text
        font-size: 20rpx;
      }
    }
  }
}
</style>
