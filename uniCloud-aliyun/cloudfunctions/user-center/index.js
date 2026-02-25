'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { action, params } = event;
    const collection = db.collection('uni-id-users');

    // Note: In a real UniCloud App, we should use the official 'uni-id-co' or 'uni-id-common' library.
    // For this migration demo, we implement basic logic to mimic the Java API behavior.

    console.log('[user-center] called with:', { action, params });

    if (action === 'register') {
        const { username, password, mobile, inviteCode } = params;

        if (!username) {
            return { code: 400, msg: 'Username is required' };
        }

        let inviterId = null;
        if (inviteCode) {
            // MVP: Assuming inviteCode is the username of the inviter
            const inviterRes = await collection.where({ username: inviteCode }).limit(1).get();
            if (inviterRes.data.length > 0) {
                inviterId = inviterRes.data[0]._id;
            }
        }

        try {
            const res = await collection.add({
                username,
                password, // Warning: Storing plain text for MVP demo.
                mobile,
                nickname: username,
                inviter_uid: [inviterId], // uni-id format array
                register_date: Date.now(),
                role: ['user']
            });

            return {
                code: 0,
                data: {
                    id: res.id,
                    username,
                    nickname: username
                }
            };
        } catch (e) {
            console.error('Register Error:', e);
            // Catch duplicate key error
            return { code: 400, msg: 'Registration failed: Username or Mobile already exists.' };
        }
    }

    if (action === 'bindInvite') {
        const { userId, inviteCode } = params;
        if (!userId || !inviteCode) return { code: 400, msg: 'Missing params' };

        // 1. Check User
        const userRes = await collection.doc(userId).get();
        if (userRes.data.length === 0) return { code: 404, msg: 'User not found' };
        const user = userRes.data[0];

        if (user.inviter_uid && user.inviter_uid.length > 0) {
            return { code: 400, msg: 'Already bound' };
        }

        // 2. Check Inviter
        const inviterRes = await collection.where({ username: inviteCode }).limit(1).get();
        if (inviterRes.data.length === 0) return { code: 404, msg: 'Inviter not found' };
        const inviter = inviterRes.data[0];

        if (inviter._id === userId) return { code: 400, msg: 'Cannot invite yourself' };

        // 3. Bind
        await collection.doc(userId).update({
            inviter_uid: [inviter._id]
        });

        return { code: 0, msg: 'Bound successfully' };
    }

    if (action === 'login') {
        const { username, password } = params;

        // Optimize: Query by Unique Username Index only
        const res = await collection.where({ username }).limit(1).get();

        if (res.data.length > 0) {
            const user = res.data[0];
            // Check password in memory
            if (user.password === password) {
                return {
                    code: 0,
                    data: {
                        id: user._id,
                        username: user.username,
                        nickname: user.nickname,
                        avatar: user.avatar,
                        role: user.role || ['user']
                    }
                };
            }
        }

        return { code: 401, msg: 'Invalid credentials' };
    }

    return { code: 400, msg: 'Unknown action' };
};
