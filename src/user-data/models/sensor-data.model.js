const Sequelize = require('sequelize')
const sequelize = require('../../__helpers/connection')

const SensorData = sequelize.define('sensor_data', {
    sensorDataId: {
        field: "sensor_data_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    device: {
        field: 'device',
        type: Sequelize.JSON,
    },
    sensorData: {
        field: 'sensor_data',
        type: Sequelize.JSON,
    },
    createOn: {
        field: 'create_on',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
})

module.exports = SensorData
