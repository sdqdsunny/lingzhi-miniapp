'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { action, params } = event;

    if (action === 'getStats') {
        const userCount = await db.collection('uni-id-users').count();
        const orderCount = await db.collection('lz-orders').count();

        const queueRes = await uniCloud.callFunction({
            name: 'lz-queue',
            data: { action: 'getQueue' }
        });

        return {
            code: 0,
            data: {
                totalUsers: userCount.total,
                totalOrders: orderCount.total,
                queueSize: queueRes.result.data.queueSize,
                poolAmount: queueRes.result.data.poolAmount
            }
        };
    }

    if (action === 'triggerSettlement') {
        return await uniCloud.callFunction({
            name: 'lz-queue',
            data: { action: 'manualSettlement' }
        });
    }

    // Get all config items
    if (action === 'getConfig') {
        const res = await db.collection('lz-config').get();
        return {
            code: 0,
            data: res.data.reduce((acc, item) => {
                acc[item.key] = { value: item.value, label: item.label, id: item._id };
                return acc;
            }, {})
        };
    }

    // Update a config item
    if (action === 'updateConfig') {
        const { key, value } = params;
        if (!key || value === undefined) {
            return { code: 400, msg: 'key and value are required' };
        }

        // Find by key and update
        const existing = await db.collection('lz-config').where({ key }).limit(1).get();
        if (existing.data.length > 0) {
            await db.collection('lz-config').doc(existing.data[0]._id).update({
                value: value,
                update_date: Date.now()
            });
            return { code: 0, msg: 'Config updated successfully' };
        } else {
            // Create new config item
            await db.collection('lz-config').add({
                key,
                value,
                label: key,
                update_date: Date.now()
            });
            return { code: 0, msg: 'Config created successfully' };
        }
    }

    return { code: 400, msg: 'Unknown action' };
};
