import { defineStore } from 'pinia'
import { login } from '@/api/user'

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: uni.getStorageSync('userInfo') || null,
        token: uni.getStorageSync('token') || '',
        isLogin: !!uni.getStorageSync('token')
    }),
    getters: {
        isAdmin: (state) => {
            if (!state.userInfo || !state.userInfo.role) return false
            return state.userInfo.role.includes('admin')
        }
    },
    actions: {
        setUserInfo(info) {
            this.userInfo = info
            uni.setStorageSync('userInfo', info)
            this.isLogin = true
        },
        setToken(token) {
            this.token = token
            uni.setStorageSync('token', token)
        },
        async login(username, password) {
            try {
                const res = await login({ username, password })

                if (res.code === 0) {
                    const user = res.data
                    this.setUserInfo(user)
                    this.setToken('cloud_token_' + user.id)
                    return { success: true }
                } else {
                    return { success: false, message: res.msg || 'Login failed' }
                }
            } catch (e) {
                return { success: false, message: e.message || 'Network error' }
            }
        },
        logout() {
            this.userInfo = null
            this.token = ''
            this.isLogin = false
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('token')
        }
    }
})
