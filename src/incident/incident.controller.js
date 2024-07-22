"use strict"

const { HttpCode } = require("../__helpers/types")
const service = require("./incident.service") 
const { token } = require("../business-logic/authentication-business-logic")
const Incident = require("../business-logic/incident-business-logic")

const incidentAlert = async (req, res, next) => {
    try {
        const result = await Incident.incidentAlert({
            userId: req.payload.userId,
            senderDeviceId: req.payload.deviceId,
            coordinates: req.body.coordinates,
            incidentType: req.body.incidentType,
            address: req.body.address,
            reportSource: req.body.reportSource
        })
        
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const getIncidentDetail = async (req, res, next) => {
    try {
        const result = await Incident.incidentDetail({
            clientUserId: req.payload.userId,
            incidentId: req.params.incidentId
        })
        
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const incidentCallAccepted = async (req, res, next) => {
    try {
        const result = await Incident.handleIncidentResponse({
            incidentId: req.params.incidentId,
            responderUserId: req.payload.userId,
            response: "accepted"
        })
        
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const incidentCallRejected = async (req, res, next) => {
    try {
        const result = await Incident.handleIncidentResponse({
            incidentId: req.params.incidentId,
            responderUserId: req.payload.userId,
            response: "rejected"
        })
        
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const incidentOnScene = async (req, res, next) => {
    try {
        const result = await Incident.handleIncidentResponse({
            incidentId: req.params.incidentId,
            responderUserId: req.payload.userId,
            response: "onScene"
        })
        
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const cancelIncident = async (req, res, next) => {
    try {
        await Incident.cancelIncident({
            incidentId: req.params.incidentId,
            userId: req.payload.userId
        })

        return res.sendStatus(HttpCode.OK)
    } catch (error) {
        return next(error)
    }
}

const incidentNotificationPage = async (req, res, next) => {
    try {
        const incidentList = await Incident.incidentNotificationPage({
            userId: req.payload.userId
        })

        if (!incidentList)
            return res.sendStatus(HttpCode.NOT_FOUND)
        
        return res.status(HttpCode.OK).send(incidentList)
    } catch (error) {
        return next(error)
    }
}

module.exports = ({ router }) => {
    router.post("/", token, incidentAlert)
    router.post("/:incidentId/accept", token, incidentCallAccepted)
    router.post("/:incidentId/reject", token, incidentCallRejected)
    router.post("/:incidentId/on-scene", token, incidentOnScene)
    router.post("/:incidentId/cancel", token, cancelIncident)
    router.get("/:incidentId", token, getIncidentDetail)
    router.get("/responder/notification-page", token, incidentNotificationPage)

    return router
}

module.exports.isRoot = false
