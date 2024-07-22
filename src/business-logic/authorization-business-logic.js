"use strict"

const { ClientError } = require("../__helpers/errors")
const { createAuthToken } = require("../__helpers/token")
const sequelize = require('../__helpers/connection')
const User = require("../user/user.service")
const Device = require("../device/device.service")
const Validation = require("../__helpers/validation")

const registerUser = async ({ phone, username, fullName, email, password, deviceInfo, isActive = true }) => {
    const transaction = await sequelize.transaction()

    try {
        Validation.defaultRegisterValidation({ phone, username, fullName, email, password })

        await User.checkUserCredentialsAvailability({ phone, username, email })

        const user = await User.create({ phone, username, fullName, email, deviceInfo, isActive }, { transaction })

        await User.createUserPassword({ userId: user.userId, password }, { transaction })

        deviceInfo = await upsertDevice({ userId: user.userId, ...deviceInfo }, { transaction })

        await transaction.commit()

        return {
            user,
            token: createAuthToken({ 
            data: { 
                userId: user.userId, 
                deviceId: deviceInfo.deviceId
            }
            })
        }

    } catch (error) {
        await transaction.rollback()

        throw error
    }
}

const login = async ({ phone, password, deviceInfo }) => {
    // ... Get user
    const user = await User.detail({ query: { phone }})
    if (!user)
        throw new ClientError("User not found!", "USER_NOT_FOUND")
    else if (!user.isActive)
        throw new ClientError("User is not active!", "USER_NOT_ACTIVE")

    // ... Match password
    await User.checkUserPassword({ userId: user.userId, password })

    // ... Upsert device
    deviceInfo = await upsertDevice({
        userId: user.userId,
        ...deviceInfo
    })

    return {
        user,
                token: createAuthToken({ 
            data: { 
                userId: user.userId, 
                deviceId: deviceInfo.deviceId
            }
        })
    }
}

const logout = async ({ deviceId }) => {
    await Device.logoutDevice({ deviceId })
}

const upsertDevice = async ({ userId, deviceBrand, deviceModel, osVersion, appVersion, firebaseToken }, options = {}) => {
    let device = await Device.getLatestDeviceByUser({ firebaseToken, userId })

    if (device)
        device = await Device.update({ deviceId: device.deviceId }, { isLogin: true, deviceBrand, deviceModel, osVersion, appVersion, firebaseToken }, options)
    else 
        device = await Device.create({ isLogin: true, userId, deviceBrand, deviceModel, osVersion, appVersion, firebaseToken }, options)

    return device
}

module.exports = {
    registerUser, login, logout, upsertDevice
}
