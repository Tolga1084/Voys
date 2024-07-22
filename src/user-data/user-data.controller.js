"use strict"

const { HttpCode } = require("../__helpers/types")
const service = require("./user-data.service") 
const { token } = require("../business-logic/authentication-business-logic")
const { processSensorData } = require("../business-logic/user-data-business-logic")

// bodyParser automatically decompresses gzip
const saveSensorData = async (req, res, next) => {
    try {
        const deviceId = req.payload.deviceId
        const sensorData = req.body

        await processSensorData({ deviceId, sensorData })

        return res.sendStatus(HttpCode.OK)
    } catch (error) {
        return next(error)
    }
}

const startTrackingLocation = async (req, res, next) => {
    try {
        const userId = req.payload.userId
        const deviceId = req.payload.deviceId
        const startingCoordinates = req.body.startingCoordinates

        await service.startTrackingLocation({ userId, deviceId, startingCoordinates })

        return res.sendStatus(HttpCode.OK)
    } catch (error) {
        return next(error)
    }
}

const updateTrackingLocation = async (req, res, next) => {
    try {
        const userId = req.payload.userId
        const deviceId = req.payload.deviceId
        const currentCoordinates = req.body.currentCoordinates

        await service.updateTrackingLocation({ userId, deviceId, currentCoordinates })

        return res.sendStatus(HttpCode.OK)
    } catch (error) {
        return next(error)
    }
}

const stopTrackingLocation = async (req, res, next) => {
    try {
        const userId = req.payload.userId
        const deviceId = req.payload.deviceId
        const endingCoordinates = req.body.endingCoordinates

        await service.stopTrackingLocation({ userId, deviceId, endingCoordinates })

        return res.sendStatus(HttpCode.OK)
    } catch (error) {
        return next(error)
    }
}


module.exports = ({ router }) => {
    router.post("/sensor", token, saveSensorData)
    router.post("/location/start", token, startTrackingLocation)
    router.post("/location/update", token, updateTrackingLocation)
    router.post("/location/stop", token, stopTrackingLocation)

    return router
}

module.exports.isRoot = false
