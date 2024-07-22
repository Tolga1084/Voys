"use strict"

const incidentType = {
    traffic: 1   
}

// rejected status is not included here
const incidentStatus = {
    new: 0,
    respondersNotified: 10,
    respondersRejected: 11,
    respondersEnrouteCancelled: 19,
    respondersEnroute: 20,
    respondersOnScene: 30,
    // isActive is false for the following statuses
    incidentCancelled: 80,
    incidentClosed: 90,
    falsePositive: 99
}

const reportSource = {
    user: 1,
    device: 2
}

const responderStatus = {
    new: 0,
    notified: 10,
    rejected: 11,
    enrouteCancelled: 19,
    enroute: 20,
    onScene: 30
}

module.exports = {
    incidentType,
    incidentStatus,
    reportSource,
    responderStatus
}