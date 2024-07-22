"use strict"

const { HttpCode } = require("../__helpers/types")
const Authorization = require("../business-logic/authorization-business-logic")
const { token } = require("../business-logic/authentication-business-logic") 

const registerUser = async (req, res, next) => {
    try {
        const user = await Authorization.registerUser({ ...req.body })

        return res.status(HttpCode.CREATED).send(user)
    } catch (error) {
        return next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const result = await Authorization.login({ ...req.body })

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const result = await Authorization.logout({ deviceId: req.payload.deviceId })

        return res.status(HttpCode.NO_CONTENT).send(result)
    } catch (error) {
        const ad = error
        return next(error)
    }
}


// ... Define routes
module.exports = ({ router }) => {
    router.post("/register-user", registerUser)
    router.post("/login", login)
    router.post("/logout", token, logout)
    
    return router
}

module.exports.isRoot = false
