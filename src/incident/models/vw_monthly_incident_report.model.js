const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const VW_monthly_incident_report = sequelize.define('vw_monthly_incident_report', {
    month: {
        field: "month",
        type: Sequelize.TEXT,
        primaryKey: true,
    },
    year: {
        field: "year",
        type: Sequelize.TEXT,
    },
    incidentCount: {
        field: "incident_count",
        type: Sequelize.INTEGER,
    }
}, {
        timestamps: false
    }
)

module.exports = VW_monthly_incident_report
