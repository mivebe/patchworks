import * as t from '../actionTypes'

export const setUsernameAction = (name) => ({
    type: t.SET_NAME,
    payload: name,
});

export const updateChatAction = (message) => ({
    type: t.SET_CHAT,
    payload: message,
})