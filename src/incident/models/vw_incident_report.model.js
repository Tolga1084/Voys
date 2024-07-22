const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const VW_incident_report = sequelize.define('vw_incident_report', {
    incidentId: {
        field: "incident_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    incidentStatus: {
        field: "incident_status",
        type: Sequelize.STRING,
    },
    incidentType: {
        field: "incident_type",
        type: Sequelize.STRING,
    },
    reportSource: {
        field: "report_source",
        type: Sequelize.STRING,
    },
    createOn: {
        field: "create_on",
        type: Sequelize.DATE,
    },
    isActive: {
        field: "is_active",
        type: Sequelize.BOOLEAN,
    },
    coordinates: {
        field: "coordinates",
        type: Sequelize.JSON,
    },
    address: {
        field: "address",
        type: Sequelize.JSON,
    },
    userId: {
        field: "user_id",
        type: Sequelize.INTEGER,
    },
    username: {
        field: "username",
        type: Sequelize.STRING,
    },
    fullName: {
        field: "full_name",
        type: Sequelize.STRING,
    },
    phone: {
        field: "phone",
        type: Sequelize.STRING,
    },
    email: {
        field: "email",
        type: Sequelize.STRING,
    }
}, {
    timestamps: false
})

module.exports = VW_incident_report