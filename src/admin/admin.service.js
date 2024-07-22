"use strict"

const { User, UserPassword, Role, UserRoles } = require("./models")
const { ClientError, UnauthorizedError } = require("../__helpers/errors")
const crypto = require("crypto")
const { createAdminToken } = require("../__helpers/admin-token")

const login = async ({ username, password }) => {
    // ... Get user
    let user = await detailWithRoles({ query: { username }})
    if (!user)
        throw new UnauthorizedError("User not found!", "USER_NOT_FOUND")
    else if (!user.isActive)
        throw new UnauthorizedError("User is not active!", "USER_NOT_ACTIVE")

    // ... Match password
    await checkUserPassword({ userId: user.userId, password })

    await updateLoginState({ userId: user.userId, isLogin: true })

    user = {
        userId: user.userId,
        username: user.username,
        roles: user.roles
    }

    return {
        user,
        token: createAdminToken({ 
            data: { 
                userId: user.userId, 
                roles: user.roles
            }
        })
    }
}

const logout = async ({ userId }) => {
    await updateLoginState({ userId, isLogin: false })
}


const detail = async ({ query }) => {

    const user = await User.findOne({ raw: true, where: { ...query }})
    if (!user)
        return null

    return user
}

const updateLoginState = async ({ userId, isLogin }) => {
    await User.update({ isLogin }, { where: { userId }})
}

const detailWithRoles = async ({ query }) => {

    const user = await User.findOne({ raw: true, where: { ...query }})
    if (!user)
        return null

    user.roleIds = await UserRoles.findAll({ raw: true, attributes: ["roleId"] ,where: { userId: user.userId }})
    user.roleIds = user.roleIds.map(role => role.roleId)

    user.roles = await Role.findAll({ raw: true, attributes: ["role"], where: { roleId: user.roleIds }})
    user.roles = user.roles.map(role => role.role)

    return user
}

const checkUserPassword = async ({ userId, password }) => {
    password = crypto.createHash("sha256").update(password).digest("hex")

    const passwordMatch = await UserPassword.findOne({ where: { userId, password }})
    if (!passwordMatch)
        throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS")
}

module.exports = {
    detail, checkUserPassword, detailWithRoles , updateLoginState, login, logout
}