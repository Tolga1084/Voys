const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const Incident = sequelize.define('incidents', {
    incidentId: {
        field: "incident_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    isDeleted: {
        field: "is_deleted",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isActive: {
        field: "is_active",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    userId: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        allowNull: false
    },
    deviceId: {
        field: 'device_id',
        type: Sequelize.INTEGER,
        allowNull: false
    },
    incidentType: {
        field: 'incident_type',
        type: Sequelize.INTEGER,
        allowNull: false
    },
    notifiedUsers : {
        field: 'notified_users',
        type: Sequelize.ARRAY(Sequelize.INTEGER)
    },   
    coordinates: {
        field: 'coordinates',
        type: Sequelize.JSON
    },
    address: {
        field: 'address',
        type: Sequelize.JSON
    },
    incidentStatus: {
        field: 'incident_status',
        type: Sequelize.INTEGER,
        allowNull: false
    },
    reportSource: {
        field: 'report_source',
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
        where: { isDeleted: false, isActive: true },
        attributes: { exclude: ['isDeleted'] }
    }
})

module.exports = Incident
