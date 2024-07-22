const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const ResponderInfo = sequelize.define('vw_responder_info', {
    userId: {
        field: "user_id",
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    username: {
        field: "username",
        type: Sequelize.STRING
    },
    fullName: {
        field: "full_name",
        type: Sequelize.STRING
    },
    isFirstResponder: {
        field: "is_first_responder",
        type: Sequelize.BOOLEAN
    },
    deviceId: {
        field: "device_id",
        type: Sequelize.INTEGER
    },
    firebaseToken: {
        field: "firebase_token",
        type: Sequelize.STRING
    },
    incidentResponderId: {
        field: "incident_responder_id",
        type: Sequelize.INTEGER
    },
    incidentId: {
        field: "incident_id",
        type: Sequelize.INTEGER
    },
    responderStatus: {
        field: "responder_status",
        type: Sequelize.INTEGER
    },
    responderStatusId: {
        field: "responder_status_id",
        type: Sequelize.INTEGER
    },
    incidentIsActive: {
        field: "incident_is_active",
        type: Sequelize.BOOLEAN
    }
}, {
    timestamps: false
})

module.exports = ResponderInfo