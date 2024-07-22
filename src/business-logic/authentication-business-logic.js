"use strict"

const moment = require("moment")
const { UnauthorizedError } = require("../__helpers/errors")
const { checkAuthToken } = require("../__helpers/token")
const User = require("../user/user.service")
const Device = require("../device/device.service")
const Admin = require("../admin/admin.service") 
const { checkAdminToken } = require("../__helpers/admin-token")

const adminToken = async (req, res, next) => {
    try {
        if (req.headers.token) {
            req.payload = req.payload = await tokenAdminCheck({ token: req.headers.token })
            return next()
        }

        throw new UnauthorizedError("Unauthorized! Invalid token!")
    } catch (error) {
        next(error)
    }
}

const tokenAdminCheck = async ({ token, requiredRole }) => {
    const payload = await checkAdminToken({ token })
    if (!payload)
        throw new UnauthorizedError("Invalid admin token!")
    
    if (moment(payload.expire) < moment(new Date()))
        throw new UnauthorizedError("Invalid admin token! Admin token expired!")

    // ... User control
    const userInfo = await Admin.detail({ query: { userId: payload.userId }})
    if (!userInfo) {
        throw new UnauthorizedError("ınvalid admin token! Admin was not found!")
    }

    if (!userInfo.isActive) {
        throw new UnauthorizedError("Admin is not active!")
    }

    if (!userInfo.isLogin)  {
        throw new UnauthorizedError("Admin is not login!")
    }

    if(requiredRole && !payload.roles.includes("ADMIN") && !payload.roles.includes(requiredRole)) {
        throw new UnauthorizedError("Admin does not have permission!")
    }

    return payload
}

const token = async (req, res, next) => {
    try {
        if (req.headers.token) {
            req.payload = req.payload = await tokenUserCheck({ token: req.headers.token })
            return next()
        }

        throw new UnauthorizedError("Unauthorized! Invalid token!")
    } catch (error) {
        next(error)
    }
}

const tokenUserCheck = async ({ token }) => {
    const payload = await checkAuthToken({ token })
    if (!payload)
        throw new UnauthorizedError("Invalid token!")
    
    if (moment(payload.expire) < moment(new Date()))
        throw new UnauthorizedError("Invalid token! Token expired!")

        // ... User control
    const userInfo = await User.detail({ query: { userId: payload.userId }})
    if (!userInfo) {
        throw new UnauthorizedError("ınvalid token! User was not found!")
    }
    if (!userInfo.isActive) {
        throw new UnauthorizedError("User is not active!")
    }
    
    // ... Device control
    const deviceInfo = await Device.detail({ query: { deviceId: payload.deviceId }})
    if (!deviceInfo.isLogin)
        throw new UnauthorizedError("User is not login!")

    return payload
}

module.exports = {
    token, tokenUserCheck, adminToken, tokenAdminCheck
}
