"use strict"

const { Device } = require("./models")

const create = async ({ userId, deviceBrand, deviceModel, osVersion, appVersion, firebaseToken }, options = {}) => {
    return await Device.create({ isLogin: true, userId, deviceBrand, deviceModel, osVersion, appVersion, firebaseToken, lastLogin: new Date() }, options)
}

const update = async ({ deviceId }, { deviceBrand, deviceModel, osVersion, appVersion, firebaseToken }, options = {}) => {
    const [rowsUpdate, [firstUpdatedDevice]] = await Device.update(
        { isLogin: true, deviceBrand, deviceModel, osVersion, appVersion, firebaseToken },
        { where: { deviceId }, returning: true, individualHooks: true , ...options }
    )
    
    if(rowsUpdate === 0) {
        return null // No device was found with the given deviceId
    }
    
    return firstUpdatedDevice.get({ plain: true })
}

const detail = async ({ query }) => {
    return await Device.findOne({ raw: true, where: { ...query }})
}

const getLatestDeviceByUser = async ({ userId }) => {
    return await Device.findOne({ 
        raw: true, 
        where: { userId }, 
        order: [['lastLogin', 'DESC']]
    })
}

const logoutDevice = async ({ deviceId }) => {
    let device = await Device.findOne({ where: { deviceId }})
    if (!device)
        return null

    device = await device.update({ isLogin: false })
    return device.get({ plain: true })
}

const logoutUser = async ({ userId }) => {
    await Device.update({ isLogin: false }, { where: { userId }})

    return { isSuccess: true }
}

const updateFirebaseToken = async ({ deviceId }, { firebaseToken }) => {
    let device = await Device.findOne({ where: { deviceId }})
    if (!device)
        return null

    device = await device.update({ firebaseToken })
    return device.get({ plain: true })
}

module.exports = {
    create,
    update,
    detail,
    logoutDevice,
    logoutUser,
    updateFirebaseToken,
    getLatestDeviceByUser
}
