"use strict"

const { HttpCode } = require("../__helpers/types")
const service = require("./admin.service") 
const { adminToken } = require("../business-logic/authentication-business-logic")
const AdminPanel = require("../business-logic/admin-panel-business-logic")

const me = async (req, res, next) => {
    try {
        const user = await service.detail({ query: { userId: req.payload.userId }})
        user.roles = req.payload.roles

        if (!user)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(user)
    } catch (error) {
        return next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const result = await service.login({ ...req.body })

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const result = await service.logout({ userId: req.payload.userId })

        return res.status(HttpCode.NO_CONTENT).send(result)
    } catch (error) {
        return next(error)
    }
}

const getActiveUsers = async (req, res, next) => {
    try {
        const result = await AdminPanel.getActiveUsers()

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const homePage = async (req, res, next) => {
    try {
        const result = await AdminPanel.homePage()

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const getIncidentReports = async (req, res, next) => {
    try {
        if (!req.query.startDate)
            return res.sendStatus(HttpCode.BAD_REQUEST)

        if (!req.query.endDate)
            req.query.endDate = new Date()

        const result = await AdminPanel.getIncidentReports({ startDate: req.query.startDate, endDate: req.query.endDate })

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

module.exports = ({ router }) => {
    router.get("/me", adminToken, me)
    router.post("/login", login)
    router.post("/logout", adminToken, logout)
    router.get("/user-list", adminToken, getActiveUsers)
    router.get("/home-page", adminToken, homePage)
    router.get("/incidents", adminToken, getIncidentReports)

    return router
}

module.exports.isRoot = false
