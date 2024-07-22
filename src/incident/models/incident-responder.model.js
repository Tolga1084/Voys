const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const IncidentResponder = sequelize.define('incident_responder', {
    incidentResponderId: {
        field: "incident_responder_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    incidentId: {
        field: "incident_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userId: {
        field: "user_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        field: "status",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    incidentIsActive: {
        field: "incident_is_active",
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    createOn: {
        field: 'create_on',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    defaultScope: {
        where: { incidentIsActive: true },
    },
    timestamps: false
})

module.exports = IncidentResponder
