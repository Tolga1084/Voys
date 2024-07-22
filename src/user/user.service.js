"use strict"

const { User, UserPassword } = require("./models")
const {ClientError, UnauthorizedError} = require("../__helpers/errors")
const { passwordValidator } = require("../__helpers/validation")
const { Op } = require('sequelize');
const crypto = require("crypto")

const all = async ({ query }) => {

/*     if (query.username)
        query.username = {[Op.iLike]: "%" + query.username + "%"}

    if (query.fullName)
        query.fullName = {[Op.iLike]: "%" + query.fullName + "%"} */

    
    const users = await User.findAll({ raw: true, where: { ...query }, order: [["userId", "DESC"]]})

    return users
}

const count = async ({ query }) => {

    const users = await User.count({ raw: true, where: { ...query }})

    return users
}

const getFirstResponderIds = async () => {
    const users = await User.findAll({ raw: true, where: { isFirstResponder: true }, attributes: ['userId'], order: [["userId", "DESC"]]})
    const userIdArray = users.map(user => user.userId)
    return userIdArray
}

const detail = async ({ query }) => {

    const user = await User.findOne({ raw: true, where: { ...query }})
    if (!user)
        return null

    return user
}

const create = async ({
                        isActive,
                        username,
                        fullName,
                        phone,
                        email
                    }, options = {}) => {

    const user = await User.create({
        isActive,
        username,
        fullName,
        phone,
        email
    }, options)

    return user.get({plain: true})
}

const update = async ({userId}, {
                          isActive,
                          username,
                          fullName,
                          phone
                      }) => {

    let user = await User.findOne({where: {userId}})
    if (!user)
        return null

    const userPhone = await User.findOne({where: {phone}})
    if (!userPhone)
        throw new ClientError("User phone already exist!", "USER_ALREADY_EXIST")

    // ... Check username
    if (username && (user.username !== username))
        await availableUsername({username})

    user = await user.update({
        isActive,
        username,
        fullName,
        phone
    })

    return user.get({plain: true})
}

const updatePassword = async ({ userId, oldPassword, newPassword }) => {

    await checkUserPassword({ userId, password: oldPassword })

    passwordValidator(newPassword)

    return await createUserPassword({ userId, password: newPassword }, { where: { userId }})
}


const createUserPassword = async ({ userId, password }, options = {}) => {
    // ... Remove old password
    await UserPassword.update({ isDeleted: true }, { where: { userId } })

    password = crypto.createHash("sha256").update(password).digest("hex")
    await UserPassword.create({ userId, password }, options)

    return {
        isSuccess: true
    }
}

const checkUserPassword = async ({ userId, password }) => {
    password = crypto.createHash("sha256").update(password).digest("hex")

    const passwordMatch = await UserPassword.findOne({ where: { userId, password }})
    if (!passwordMatch)
        throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS")
}

const checkUserCredentialsAvailability = async ({ phone, email, username }) => {
    const user = await User.findOne({
        where: {
            [Op.or]: [
                { phone },
                { email },
                { username }
            ]
        }
    })

    if (user) {
        if (user.username === username)
            throw new ClientError("The username has already been taken!", "DUPLICATE_USERNAME")
        else if (user.phone === phone)
            throw new ClientError("This phone number has already been taken!", "DUPLICATE_PHONE")
        else if (user.email === email)
            throw new ClientError("This email address has already been taken!", "DUPLICATE_EMAIL")
    }
}

module.exports = {
    all, detail, create, update, createUserPassword, checkUserPassword,
    checkUserCredentialsAvailability, getFirstResponderIds, count, updatePassword
}