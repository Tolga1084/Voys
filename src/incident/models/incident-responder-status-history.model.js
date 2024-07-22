const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const IncidentResponderStatusHistory = sequelize.define('incident_responder_status_history', {
    IncidentResponderStatusHistoryId: {
        field: "incident_responder_status_history_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    incidentResponderId: {
        field: "incident_responder_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        field: "status",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createOn: {
        field: 'create_on',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
    defaultScope: {
        where: { isDeleted: false },
        attributes: { exclude: ['isDeleted'] }
    }
})

module.exports = IncidentResponderStatusHistory
