"use strict"

const { HttpCode } = require("../__helpers/types")
const service = require("./device.service")

const detail = async (req, res, next) => {
    try {
        const device = await service.detail({ deviceId: req.params.deviceId })

        if (!device)
            return res.sendStatus(HttpCode.NOT_FOUND)
        
        return res.status(HttpCode.OK).send(device)
    } catch (error) {
        return next(error)
    }
}

const upsert = async (req, res, next) => {
    try {
        const device = await service.upsert({ ...req.body })

        return res.status(HttpCode.OK).send(device)
    } catch (error) {
        return next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const device = await service.logout({ deviceId: req.params.deviceId })

        if (!device)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(device)
    } catch (error) {
        return next(error)
    }
}

const updateFirebaseToken = async (req, res, next) => {
    try {
        const device = await service.updateFirebaseToken({ deviceId: req.params.deviceId }, { ...req.body })

        if (!device)
            return res.sendStatus(HttpCode.NOT_FOUND)
        
        return res.status(HttpCode.OK).send(device)
    } catch (error) {
        return next(error)
    }
}

// ... Define routes
module.exports = ({ router }) => {
    /* router.post("/", upsert)
    router.get("/:deviceId", detail)
    router.patch("/:deviceId/logout", logout)
    router.patch("/:deviceId/firebase-token", updateFirebaseToken) */
    
    return router
}

module.exports.isRoot = false
