const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const LocationData = sequelize.define('location_data', {
    userId: {
        field: "user_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    deviceId: {
        field: 'device_id',
        type: Sequelize.INTEGER,
        allowNull: false
    },
    incidentId: {
        field: 'incident_id',
        type: Sequelize.INTEGER,
        allowNull: false
    },
    startingCoordinates: {
        field: 'coordinates',
        type: Sequelize.JSON,
        allowNull: false
    },
    currentCoordinates: {
        field: 'coordinates',
        type: Sequelize.JSON
    },
    endingCoordinates: {
        field: 'coordinates',
        type: Sequelize.JSON
    },
    createOn: {
        field: 'create_on',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    locationTrackingEndTime: {
        field: 'track_end_time',
        type: Sequelize.DATE
    },
    isActive: {
        field: 'is_active',
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: false,
})

module.exports = LocationData
