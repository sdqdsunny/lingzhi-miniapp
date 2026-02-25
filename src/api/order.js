export const createOrder = (data) => {
    return uniCloud.callFunction({
        name: 'lz-order',
        data: { action: 'create', params: data }
    }).then(res => res.result)
}

export const payOrder = (orderId, amount, userId) => {
    return uniCloud.callFunction({
        name: 'lz-order',
        data: { action: 'pay', params: { orderId, amount, userId } }
    }).then(res => res.result)
}

export const getMyOrders = (userId) => {
    return uniCloud.callFunction({
        name: 'lz-order',
        data: { action: 'getMyOrders', params: { userId } }
    }).then(res => res.result)
}

