"use strict"

const { Incident, VW_monthly_incident_report, VW_incident_report, IncidentResponder, VW_responder_info } = require("./models")
const Enums = require("./enums")
const sequelize = require('../__helpers/connection')
const Sequelize = require('sequelize')
const { ClientError } = require("../__helpers/errors")

const create = async ({ userId, deviceId, coordinates, incidentType, reportSource, address }) => {
    const activeIncident = await Incident.findOne({ raw: true, where: { userId, isActive: true }})
    if (activeIncident)
        throw new ClientError("User already has an active incident!", "USER_ALREADY_HAS_ACTIVE_INCIDENT")

    const incident = await Incident.create({ userId, deviceId, coordinates, incidentType, reportSource, address, incidentStatus: Enums.incidentStatus.new })

    return incident.get({plain: true})
}

const count = async ({ query }) => {
    
    const incidents = await Incident.count({ raw: true, where: { ...query }})

    return incidents
}

const getActiveIncidentByUserId = async ({ userId }) => {
    return await Incident.findOne({ raw: true, where: { userId, isActive: true }})
}

const cancelIncident = async ({ userId, incidentId }) => {
    return sequelize.transaction(async (t) => {
        const incident = await Incident.findOne({ where: { userId, incidentId }}, { lock: t.LOCK.UPDATE, transaction: t })
        if (!incident)
            throw new ClientError("Incident not found!", "INCIDENT_NOT_FOUND")
        await Incident.update({ isActive: false, incidentStatus: Enums.incidentStatus.incidentCancelled }, { where: { incidentId }}, { transaction: t })
        
        // lock before updating
        await IncidentResponder.findAll({ where: { incidentId: incident.incidentId }}, { lock: t.LOCK.UPDATE, transaction: t })
        await IncidentResponder.update({ incidentIsActive: false }, { where: { incidentId: incident.incidentId }}, { transaction: t })
    })  
}

const countByUserId = async ({ query }) => {
    const incidents = await Incident.findAll({
        raw: true,
        attributes: ['userId', [sequelize.fn('COUNT', sequelize.col('incident_id')), 'count']],
        where: { ...query },
        group: ['userId'],
        order: [[sequelize.literal('count'), 'DESC']],
        limit: 5 // top 5 users
    })

    return incidents
}

const update = async ({ incidentId, notifiedUsers, incidentStatus, status, isActive }) => {
    await Incident.update({ notifiedUsers, incidentStatus, status, isActive }, { where: { incidentId }})

    if (isActive === false)
        await IncidentResponder.update({ incidentIsActive: false }, { where: { incidentId }})
}

const all = async ({ query }) => {

    const incidents = await Incident.findAll({ raw: true, where: { ...query }, order: [["incidentId", "DESC"]]})

    return incidents
}

const getMonthlyCount = async () => {
    const monthlyIncidentCount = await VW_monthly_incident_report.findAll({ raw: true })

    return monthlyIncidentCount
}

const getIncidentReports = async ({ query }) => {
    const incidentReports = await VW_incident_report.findAll({ raw: true, where: { ...query }, order: [["incidentId", "DESC"]]})

    return incidentReports
}

const sendIncidentResponder = async ({ incidentId, userId }) => {
    const transaction = await sequelize.transaction()

    try {
        const [incident, incidentResponder] = await Promise.all([
            Incident.findOne({ where: { incidentId }}),
            IncidentResponder.findOne({ raw: true, where: { incidentId, userId }})
        ])

        if (!incident)
            throw new ClientError("Incident not found!", "INCIDENT_NOT_FOUND")

        if (!incidentResponder)
            throw new ClientError("Responder not found!", "RESPONDER_NOT_FOUND")

        if (incidentResponder.status >= Enums.responderStatus.enroute)
            throw new ClientError("Responder is already enroute!", "RESPONDER_ALREADY_ENROUTE")

        await updateResponderStatus({ incidentResponderId: incidentResponder.incidentResponderId, status: Enums.responderStatus.enroute }, transaction)

        if (incident.incidentStatus < Enums.incidentStatus.respondersEnroute)
            await Incident.update({ incidentStatus: Enums.incidentStatus.respondersEnroute }, { where: { incidentId }, transaction })

        await transaction.commit()

        return incidentResponder
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

const recallIncidentResponder = async ({ incidentId, userId }) => {
    const transaction = await sequelize.transaction()

    try {
        const [incident, incidentResponders] = await Promise.all([
            Incident.findOne({ where: { incidentId }}),
            IncidentResponder.findAll({ raw: true, where: { incidentId }})
        ])

        if (!incident)
            throw new ClientError("Incident not found!", "INCIDENT_NOT_FOUND")

        const incidentResponder = incidentResponders.find(responder => responder.userId === userId)

        if (!incidentResponder)
            throw new ClientError("Responder not found!", "RESPONDER_NOT_FOUND")

        if (incidentResponder.status > Enums.responderStatus.notified && incidentResponder.status < Enums.responderStatus.enroute)
            throw new ClientError("Responder has already rejected!", "RESPONDER_ALREADY_REJECTED")

        if (incidentResponder.status >= Enums.responderStatus.onScene)
            throw new ClientError("Responder is already on scene!", "RESPONDER_ALREADY_ON_SCENE")

        incidentResponder.status = incidentResponder.status >= Enums.responderStatus.enroute ? Enums.responderStatus.enrouteCancelled : Enums.responderStatus.rejected

        await updateResponderStatus({ incidentResponderId: incidentResponder.incidentResponderId, status: incidentResponder.status }, transaction)

        if (incidentResponder.status === Enums.responderStatus.enrouteCancelled) {
            const incidentResponderEnrouteOrGreater = incidentResponders.find(responder => responder.status >= Enums.responderStatus.enroute)

            if (!incidentResponderEnrouteOrGreater)
                await Incident.update({ incidentStatus: Enums.incidentStatus.respondersEnrouteCancelled }, { where: { incidentId }, transaction })
        }

        if (incidentResponder.status === Enums.responderStatus.rejected) {
            const incidentResponderEnroute = incidentResponders.find(responder => responder.status !== Enums.responderStatus.rejected)

            if (!incidentResponderEnroute)
                await Incident.update({ incidentStatus: Enums.incidentStatus.respondersRejected }, { where: { incidentId }, transaction })
        }

        await transaction.commit()

        return incidentResponder
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

const responderOnScene = async ({ incidentId, userId }) => {
    const transaction = await sequelize.transaction()

    try {
        const [incident, incidentResponder] = await Promise.all([
            Incident.findOne({ where: { incidentId }}),
            IncidentResponder.findOne({ raw: true, where: { incidentId, userId }})
        ])

        if (!incident)
            throw new ClientError("Incident not found!", "INCIDENT_NOT_FOUND")

        if (!incidentResponder)
            throw new ClientError("Responder not found!", "RESPONDER_NOT_FOUND")

        if (incidentResponder.status >= Enums.responderStatus.onScene)
            throw new ClientError("Responder is already on scene!", "RESPONDER_ALREADY_ON_SCENE")

        if (incidentResponder.status < Enums.responderStatus.enroute)
            throw new ClientError("Responder is not enroute!", "RESPONDER_NOT_ENROUTE")

        await updateResponderStatus({ incidentResponderId: incidentResponder.incidentResponderId, status: Enums.responderStatus.onScene }, transaction)

        if (incident.incidentStatus < Enums.incidentStatus.respondersOnScene)
            await Incident.update({ incidentStatus: Enums.incidentStatus.respondersOnScene }, { where: { incidentId }, transaction })

        await transaction.commit()

        return incidentResponder
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

const createIncidentResponder = async ({ incidentId, userId }) => {
    const incidentResponder = await IncidentResponder.create({ incidentId, userId, status: Enums.responderStatus.new, incidentIsActive: true })

    return incidentResponder.get({plain: true})
}

const updateResponderStatus = async ({ incidentResponderId, status }, transaction) => {
    await IncidentResponder.update({ status }, { where: { incidentResponderId }, transaction });
}

const updateResponderStatusByIncidentId = async ({ incidentId, status }, transaction) => {
    await IncidentResponder.update({ status }, { where: { incidentId }, transaction })
}

const respondersInfoByIncidentId = async ({ incidentId }) => {
    const responders = await VW_responder_info.findAll({ raw: true, where: { incidentId }})

    return responders
}

const responderInfoByIncidentId = async ({ incidentId, userId }) => {
    const responder = await VW_responder_info.findOne({ raw: true, where: { incidentId, userId }})

    return responder
}

const getMapsUrl = async (coordinates) => {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
}

const incidentInfoByIncidentId = async ({ incidentId }) => {
    const incidentPromise = VW_incident_report.findOne({ raw: true, where: { incidentId, isActive: true }})
    const respondersPromise = VW_responder_info.findAll({ raw: true, where: { incidentId }})

    const [incident, responders] = await Promise.all([incidentPromise, respondersPromise])

    if (!incident)
        return null

    incident.incidentStatus = incident.incidentStatus

    incident.mapsUrl = await getMapsUrl(incident.coordinates)
    
    return { incident, responders }
}

const getCallerByIncidentId = async ({ incidentId }) => {
    return await Incident.findOne({ raw: true, where: { incidentId }, attributes: ['userId', 'deviceId']})
}

const countIncidentsForResponder = async ({ userId }) => {
    return await IncidentResponder.count({ raw: true, where: { userId, incidentIsActive: true }}) 
}

const incidentListByResponderId = async ({ userId }) => {

   const activeIncidentsByResponder = await IncidentResponder.findAll({ raw: true, where: { userId, incidentIsActive: true }, attributes: ['incidentId']})
   const activeIncidentsByResponderArray = activeIncidentsByResponder.map(incident => incident.incidentId)
   return await VW_incident_report.findAll({ raw: true, where: { incidentId: activeIncidentsByResponderArray, isActive: true }})
}

module.exports = { Enums, create, update, getActiveIncidentByUserId, all, count, getMonthlyCount, countByUserId,
                    getIncidentReports, sendIncidentResponder, recallIncidentResponder,
                    createIncidentResponder, updateResponderStatus, updateResponderStatusByIncidentId,
                    respondersInfoByIncidentId, responderInfoByIncidentId, incidentInfoByIncidentId,
                    countIncidentsForResponder, incidentListByResponderId, getCallerByIncidentId,
                    cancelIncident, responderOnScene, getMapsUrl
                 }

 