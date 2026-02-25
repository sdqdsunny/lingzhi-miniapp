import { defineStore } from 'pinia'
import { getMyPosition } from '@/api/queue'

export const useQueueStore = defineStore('queue', {
    state: () => ({
        myRank: null, // Current position (1-indexed)
        waterLevel: 0, // Bonus pool percentage
        status: 'IDLE', // IDLE, QUEUING, FREE_WINNER
        queueItem: null,
        queueSize: 0,
        timer: null
    }),
    actions: {
        async fetchStatus(userId) {
            try {
                const res = await getMyPosition(userId)

                if (res.code === 0) {
                    const data = res.data
                    // Set actual position
                    this.myRank = data.position > 0 ? data.position : null
                    this.queueSize = data.queueSize
                    this.queueItem = data.queueItem
                    // target amount 375, poolAmount from cloud
                    this.waterLevel = Math.min(Math.floor((data.poolAmount / 375) * 100), 100)
                    this.status = data.position > 0 ? 'QUEUING' : 'IDLE'
                }
            } catch (e) {
                console.error('Failed to fetch queue status:', e)
            }
        },
        startPolling(userId) {
            this.stopPolling()
            this.fetchStatus(userId)
            this.timer = setInterval(() => {
                this.fetchStatus(userId)
            }, 5000) // Poll every 5 seconds
        },
        stopPolling() {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
        }
    }
})

