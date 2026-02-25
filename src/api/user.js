export const login = (data) => {
    return uniCloud.callFunction({
        name: 'user-center',
        data: { action: 'login', params: data }
    }).then(res => res.result)
}

export const register = (data) => {
    return uniCloud.callFunction({
        name: 'user-center',
        data: { action: 'register', params: data }
    }).then(res => res.result)
}

export const bindInviteCode = (userId, inviteCode) => {
    return uniCloud.callFunction({
        name: 'user-center',
        data: { action: 'bindInvite', params: { userId, inviteCode } }
    }).then(res => res.result)
}
