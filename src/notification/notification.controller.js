"use strict"

const { HttpCode } = require("../__helpers/types")
const service = require("./notification.service")

const sendNotificationWithFireBase = async (req, res, next) => {
    try {
        const result = await service.sendNotificationWithFireBase({ ...req.body })

        return res.status(HttpCode.CREATED).send(result)
    } catch (error) {
        return next(error)
    }
}

const all = async (req, res, next) => {
    try {
        const result = await service.all({ query: req.query })

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const saveNotification = async (req, res, next) => {
    try {
        const result = await service.saveNotification({ ...req.body })

        return res.status(HttpCode.CREATED).send(result)
    } catch (error) {
        return next(error)
    }
}

const cancelNotification = async (req, res, next) => {
    try {
        const result = await service.cancelNotification({ ...req.query })

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const pushTypes = async (req, res, next) => {
    try {
        const result = await service.pushTypes()

        return res.status(HttpCode.CREATED).send(result)
    } catch (error) {
        return next(error)
    }
}

// ... Define routes
module.exports = ({ router }) => {
    /* router.get("/", all)
    router.post("/send-firebase-notification", sendNotificationWithFireBase)
    router.post("/save", saveNotification)
    router.put("/cancel", cancelNotification)
    router.get("/type", pushTypes) */

    return router
}

module.exports.isRoot = false