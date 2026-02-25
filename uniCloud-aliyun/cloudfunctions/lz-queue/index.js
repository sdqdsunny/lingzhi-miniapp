'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const $ = dbCmd.aggregate;

const TARGET_AMOUNT = 375; // Target to trigger 1 Free Order

exports.main = async (event, context) => {
    const { action, params } = event;

    switch (action) {
        case 'processPayment':
            return await processPayment(params);
        case 'getQueue':
            return await getQueueStatus();
        case 'getMyPosition':
            return await getMyPosition(params);
        case 'accelerate':
            return await accelerateUser(params);
        case 'manualSettlement':
            return await triggerSettlement();
        default:
            return { code: 400, msg: 'Unknown action' };
    }
};

async function processPayment(params) {
    const { orderId, userId, contribution } = params;

    // 1. Add to Queue
    await db.collection('lz-queue').add({
        order_id: orderId,
        user_id: userId,
        status: 'WAITING',
        enter_time: Date.now()
    });

    // 2. Try Init Pool if not exists
    const poolRes = await db.collection('lz-bonus-pool').limit(1).get();
    let poolId;
    let currentAmount = 0;

    if (poolRes.data.length === 0) {
        const createRes = await db.collection('lz-bonus-pool').add({
            total_amount: 0,
            last_updated: Date.now()
        });
        poolId = createRes.id;
    } else {
        poolId = poolRes.data[0]._id;
        currentAmount = poolRes.data[0].total_amount;
    }

    // 3. Update Pool
    await db.collection('lz-bonus-pool').doc(poolId).update({
        total_amount: dbCmd.inc(contribution),
        last_updated: Date.now()
    });

    // 4. Check Settlement
    const newAmount = currentAmount + contribution;
    if (newAmount >= TARGET_AMOUNT) {
        await triggerSettlement();
    }

    return { code: 0, msg: 'Processed' };
}

async function triggerSettlement() {
    const transaction = await db.startTransaction();
    try {
        // Lock/Get Pool
        const poolRes = await transaction.collection('lz-bonus-pool').limit(1).get();
        if (poolRes.data.length === 0) {
            await transaction.rollback();
            return { code: 500, msg: 'Pool not found' };
        }

        const pool = poolRes.data[0];
        const canFreeCount = Math.floor(pool.total_amount / TARGET_AMOUNT);

        if (canFreeCount <= 0) {
            await transaction.rollback();
            return { code: 0, msg: 'Not enough funds', data: { pool: pool.total_amount, needed: TARGET_AMOUNT } };
        }

        // Get Winners
        const queueRes = await transaction.collection('lz-queue')
            .where({ status: 'WAITING' })
            .orderBy('enter_time', 'asc')
            .limit(canFreeCount)
            .get();

        const winners = queueRes.data;
        if (winners.length === 0) {
            await transaction.rollback();
            return { code: 0, msg: 'No one in queue', data: { canFree: canFreeCount } };
        }

        // Process Winners
        let totalDeduction = 0;
        for (const winner of winners) {
            // Update Queue Status
            await transaction.collection('lz-queue').doc(winner._id).update({
                status: 'PROMOTED',
                promote_time: Date.now()
            });
            // Update Order Status
            await transaction.collection('lz-orders').doc(winner.order_id).update({
                status: 'COMPLETED' // Means Free/Refunded in this context
            });
            totalDeduction += TARGET_AMOUNT;
        }

        // Deduct Pool
        await transaction.collection('lz-bonus-pool').doc(pool._id).update({
            total_amount: dbCmd.inc(-totalDeduction),
            last_updated: Date.now()
        });

        await transaction.commit();
        return {
            code: 0,
            msg: `Settled ${winners.length} orders`,
            data: {
                freedCount: winners.length,
                deducted: totalDeduction,
                remaining: pool.total_amount - totalDeduction
            }
        };

    } catch (e) {
        await transaction.rollback();
        return { code: 500, msg: e.message };
    }
}

async function getQueueStatus() {
    const countRes = await db.collection('lz-queue').where({ status: 'WAITING' }).count();
    const poolRes = await db.collection('lz-bonus-pool').limit(1).get();
    const amount = poolRes.data.length > 0 ? poolRes.data[0].total_amount : 0;

    return {
        code: 0,
        data: {
            queueSize: countRes.total,
            poolAmount: amount
        }
    };
}

async function getMyPosition(params) {
    const { userId } = params;
    if (!userId) {
        return { code: 400, msg: 'userId is required' };
    }

    // Get all WAITING queue items ordered by enter_time
    const allWaiting = await db.collection('lz-queue')
        .where({ status: 'WAITING' })
        .orderBy('enter_time', 'asc')
        .get();

    // Find user's earliest queue item and its position
    let myPosition = -1;
    let myQueueItem = null;
    for (let i = 0; i < allWaiting.data.length; i++) {
        if (allWaiting.data[i].user_id === userId) {
            myPosition = i + 1; // 1-indexed position
            myQueueItem = allWaiting.data[i];
            break;
        }
    }

    // Get pool info
    const poolRes = await db.collection('lz-bonus-pool').limit(1).get();
    const poolAmount = poolRes.data.length > 0 ? poolRes.data[0].total_amount : 0;

    return {
        code: 0,
        data: {
            position: myPosition,  // -1 means not in queue
            queueSize: allWaiting.data.length,
            poolAmount: poolAmount,
            queueItem: myQueueItem
        }
    };
}

/**
 * Accelerate a user's queue position
 * @param {Object} params - { userId: string, steps: number, reason: string }
 * reason: 'INVITE' (邀请加速) or 'REPURCHASE' (复购加速)
 */
async function accelerateUser(params) {
    console.log('[lz-queue] accelerateUser called with:', JSON.stringify(params));
    const { userId, steps = 3, reason = 'INVITE' } = params;

    if (!userId || steps <= 0) {
        console.log('[lz-queue] Invalid params, returning 400');
        return { code: 400, msg: 'Invalid params' };
    }

    // Get ALL waiting queue items ordered by enter_time
    const allWaiting = await db.collection('lz-queue')
        .where({ status: 'WAITING' })
        .orderBy('enter_time', 'asc')
        .get();

    // Find user's queue item position
    let userIndex = -1;
    let userQueueItem = null;
    for (let i = 0; i < allWaiting.data.length; i++) {
        if (allWaiting.data[i].user_id === userId) {
            userIndex = i;
            userQueueItem = allWaiting.data[i];
            break;
        }
    }

    console.log('[lz-queue] User current position:', userIndex + 1);

    if (userIndex === -1) {
        return { code: 0, msg: 'User has no waiting orders', data: { accelerated: 0 } };
    }

    if (userIndex === 0) {
        return { code: 0, msg: 'User already at top position', data: { accelerated: 0 } };
    }

    // Calculate target position (move up by 'steps')
    const targetIndex = Math.max(0, userIndex - steps);
    const targetQueueItem = allWaiting.data[targetIndex];

    console.log('[lz-queue] Target position:', targetIndex + 1, 'Target enter_time:', targetQueueItem.enter_time);

    // Set user's enter_time to be slightly BEFORE the target's enter_time
    const newEnterTime = targetQueueItem.enter_time - 1000; // 1 second before

    await db.collection('lz-queue').doc(userQueueItem._id).update({
        enter_time: newEnterTime,
        last_accelerate: Date.now(),
        accelerate_log: dbCmd.push([{
            type: reason,
            steps: steps,
            from_position: userIndex + 1,
            to_position: targetIndex + 1,
            time: Date.now()
        }])
    });

    const actualSteps = userIndex - targetIndex;
    console.log('[lz-queue] Acceleration complete, moved from', userIndex + 1, 'to', targetIndex + 1);

    return {
        code: 0,
        msg: `Accelerated from position ${userIndex + 1} to ${targetIndex + 1} (${actualSteps} steps)`,
        data: {
            accelerated: 1,
            steps: actualSteps,
            from: userIndex + 1,
            to: targetIndex + 1
        }
    };
}

