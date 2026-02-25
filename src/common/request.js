import Request from 'luch-request'
import { useUserStore } from '@/store/user'

const http = new Request()

http.setConfig((config) => {
    config.baseURL = '/api'
    config.timeout = 5000
    config.header = {
        'Content-Type': 'application/json'
    }
    return config
})

http.interceptors.request.use((config) => {
    const userStore = useUserStore()
    /* 
       Mock Authentication:
       In a real Mini-App, we'd pass the token. 
       For MVP, we might pass the userId directly if we are skipping full Auth,
       or a mock token.
    */
    if (userStore.userInfo && userStore.userInfo.id) {
        config.header['X-User-Id'] = userStore.userInfo.id
    }
    return config
}, config => {
    return Promise.reject(config)
})

http.interceptors.response.use((response) => {
    // Assuming backend returns { code: 200, data: ..., msg: ... }
    // But Spring Boot standard might just return the object.
    // Let's assume standard response for now.
    return response.data
}, (response) => {
    return Promise.reject(response)
})

export default http
