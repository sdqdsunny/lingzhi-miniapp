export const getProductList = () => {
    return uniCloud.callFunction({
        name: 'lz-product',
        data: { action: 'getList' }
    }).then(res => res.result)
}

export const getProductById = (productId) => {
    return uniCloud.callFunction({
        name: 'lz-product',
        data: { action: 'getById', params: { productId } }
    }).then(res => res.result)
}
