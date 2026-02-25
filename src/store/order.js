import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { createOrder, payOrder } from '@/api/order'

export const useOrderStore = defineStore('order', {
    state: () => ({
        currentOrder: null,
    }),
    actions: {
        async create(data) {
            try {
                const res = await createOrder(data)
                // Return raw result or normalized result
                if (res.code === 0) {
                    this.currentOrder = res.data
                    return { code: 0, data: res.data }
                } else {
                    return { code: res.code, message: res.msg }
                }
            } catch (e) {
                return { code: 500, message: e.message }
            }
        },
        async pay(orderId) {
            const userStore = useUserStore()
            console.log('Paying for order:', orderId, 'User:', userStore.userInfo.id)

            try {
                // Determine amount? For MVP we assume standard 375 or params passed.
                // The API needs amount. Store doesn't seem to pass it in pay action signature?
                // The current payOrder API requires (orderId, amount). 
                // The store action 'pay(orderId)' assumes amount is known or handled.
                // Let's assume standard amount for MVP or pass 375.
                const res = await payOrder(orderId, 375, userStore.userInfo.id)

                if (res.code === 0) {
                    return { code: 0, data: res.data }
                } else {
                    return { code: res.code, message: res.msg }
                }
            } catch (e) {
                return { code: 500, message: e.message }
            }
        }
    }
})
