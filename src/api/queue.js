export const getQueueStatus = (userId) => {
    return uniCloud.callFunction({
        name: 'lz-queue',
        data: { action: 'getQueue', params: { userId } }
    }).then(res => res.result)
}

export const getMyPosition = (userId) => {
    return uniCloud.callFunction({
        name: 'lz-queue',
        data: { action: 'getMyPosition', params: { userId } }
    }).then(res => res.result)
}

export const triggerSettlement = () => {
    // For Admin debug mostly
    return uniCloud.callFunction({
        name: 'lz-queue',
        data: { action: 'manualSettlement' }
    }).then(res => res.result)
}

