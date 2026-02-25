'use strict';
const db = uniCloud.database();
const dbCmd = db.command;

exports.main = async (event, context) => {
    const { action, params } = event;
    // context.auth contains user info if token is passed

    switch (action) {
        case 'create':
            return await createOrder(params, context);
        case 'pay':
            return await payOrder(params, context);
        case 'getMyOrders':
            return await getMyOrders(params);
        default:
            return { code: 400, msg: 'Unknown action' };
    }
};

async function createOrder(params, context) {
    const res = await db.collection('lz-orders').add({
        user_id: params.userId || context.auth.uid, // Support both for testing
        product_id: params.productId,
        amount: params.amount,
        status: 'PENDING',
        create_date: Date.now()
    });
    return { code: 0, data: { orderId: res.id }, msg: 'Order created' };
}

async function payOrder(params, context) {
    const orderId = params.orderId;
    const userId = params.userId || context.auth.uid;

    // 1. Mark Order as PAID
    await db.collection('lz-orders').doc(orderId).update({
        status: 'PAID'
    });

    // 2. Add to Queue & Update Pool (Call lz-queue logic)
    // We simulate that a portion of the payment goes to the pool.
    // Let's say 25% of amount goes to pool.
    const contribution = params.amount * 0.25;

    await uniCloud.callFunction({
        name: 'lz-queue',
        data: {
            action: 'processPayment',
            params: {
                orderId: orderId,
                userId: userId,
                contribution: contribution
            }
        }
    });

    // Load acceleration config from database
    const configRes = await db.collection('lz-config').get();
    const config = configRes.data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});
    const inviteSteps = config.invite_acceleration_steps || 3;
    const repurchaseSteps = config.repurchase_acceleration_steps || 2;
    console.log('[lz-order] Config loaded - inviteSteps:', inviteSteps, 'repurchaseSteps:', repurchaseSteps);

    // 3. Check if this user has an inviter (邀请加速)
    console.log('[lz-order] Checking inviter for userId:', userId);
    const userRes = await db.collection('uni-id-users').doc(userId).get();
    console.log('[lz-order] User query result:', JSON.stringify(userRes));

    // doc().get() returns { data: [ {...} ] } in UniCloud
    if (userRes.data && userRes.data.length > 0) {
        const userData = userRes.data[0];
        console.log('[lz-order] User data:', JSON.stringify(userData));

        // Check inviter_uid array (uni-id format) - filter out null values
        const validInviters = (userData.inviter_uid || []).filter(id => id !== null);
        if (validInviters.length > 0) {
            const inviterId = validInviters[0];
            console.log('[lz-order] Found inviter, triggering acceleration for:', inviterId, 'steps:', inviteSteps);

            // Trigger acceleration for inviter (configurable positions)
            const accelRes = await uniCloud.callFunction({
                name: 'lz-queue',
                data: {
                    action: 'accelerate',
                    params: {
                        userId: inviterId,
                        steps: inviteSteps,
                        reason: 'INVITE'
                    }
                }
            });
            console.log('[lz-order] Acceleration result:', JSON.stringify(accelRes.result));
        } else {
            console.log('[lz-order] No valid inviter found');
        }
    } else {
        console.log('[lz-order] User not found in uni-id-users');
    }

    // 4. Check for repurchase acceleration (复购加速)
    // If user has previous PAID orders, accelerate their OWN queue (configurable positions)
    const previousOrders = await db.collection('lz-orders')
        .where({
            user_id: userId,
            status: 'PAID',
            _id: dbCmd.neq(orderId) // Exclude current order
        })
        .limit(1)
        .get();

    if (previousOrders.data.length > 0) {
        console.log('[lz-order] User has previous orders, triggering repurchase acceleration, steps:', repurchaseSteps);
        const repurchaseRes = await uniCloud.callFunction({
            name: 'lz-queue',
            data: {
                action: 'accelerate',
                params: {
                    userId: userId,
                    steps: repurchaseSteps,
                    reason: 'REPURCHASE'
                }
            }
        });
        console.log('[lz-order] Repurchase acceleration result:', JSON.stringify(repurchaseRes.result));
    }

    return { code: 0, msg: 'Payment successful' };
}

async function getMyOrders(params) {
    const { userId } = params;
    if (!userId) {
        return { code: 400, msg: 'userId is required' };
    }

    const ordersRes = await db.collection('lz-orders')
        .where({ user_id: userId })
        .orderBy('create_date', 'desc')
        .limit(50)
        .get();

    // Get queue status for each order
    const orders = ordersRes.data.map(order => ({
        ...order,
        id: order._id,
        statusText: order.status === 'PAID' ? '已支付' : order.status === 'FREE' ? '已免单' : '待支付',
        createTime: new Date(order.create_date).toLocaleString('zh-CN')
    }));

    return {
        code: 0,
        data: orders,
        msg: 'success'
    };
}
