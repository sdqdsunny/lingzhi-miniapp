'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { action, params } = event;

    switch (action) {
        case 'getList':
            return await getProductList();
        case 'getById':
            return await getProductById(params);
        default:
            return { code: 400, msg: 'Unknown action' };
    }
};

async function getProductList() {
    const res = await db.collection('lz-products')
        .where({ status: 'ACTIVE' })
        .orderBy('sort_order', 'asc')
        .limit(50)
        .get();

    return {
        code: 0,
        data: res.data.map(p => ({
            ...p,
            id: p._id
        })),
        msg: 'success'
    };
}

async function getProductById(params) {
    const { productId } = params;
    if (!productId) {
        return { code: 400, msg: 'productId is required' };
    }

    const res = await db.collection('lz-products').doc(productId).get();

    if (res.data && res.data.length > 0) {
        return { code: 0, data: res.data[0], msg: 'success' };
    }
    return { code: 404, msg: 'Product not found' };
}
