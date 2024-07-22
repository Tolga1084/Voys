const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const IncidentStatusHistory = sequelize.define('incident_status_history', {
    IncidentStatusHistoryId: {
        field: "incident_status_history_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    incidentId: {
        field: "incident_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    incidentStatus: {
        field: "incident_status",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createOn: {
        field: 'create_on',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false
})

module.exports = IncidentStatusHistory
