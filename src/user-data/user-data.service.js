"use strict"

const { SensorData, locationData }= require("./models")

const saveSensorData = async ({ deviceStringified, sensorData }) => {
    try {
        const deviceData = JSON.parse(deviceStringified)
        
        await SensorData.create({
            device: deviceData,
            sensorData
        })
        
    } catch (error) {
        console.error(error)
    }
}

const startTrackingLocation = async ({ userId, incidentId, startingCoordinates }) => {
    try {
        await locationData.create({
            userId,
            incidentId,
            startingCoordinates
        })
    } catch (error) {
        console.error(error)
    }
}

const updateTrackingLocation = async ({ userId, incidentId, currentCoordinates }) => {
    try {
        await locationData.update({
            currentCoordinates
        }, {
            where: {
                userId,
                incidentId,
                isActive: true
            }
        })
    } catch (error) {
        console.error(error)
    }
}

const stopTrackingLocation = async ({ userId, incidentId, endingCoordinates }) => {
    try {
        await locationData.update({
            endingCoordinates,
            isActive: false
        }, {
            where: {
                userId,
                incidentId,
                isActive: true
            }
        })
    } catch (error) {
        console.error(error)
    }
}

module.exports = { saveSensorData, startTrackingLocation, updateTrackingLocation, stopTrackingLocation }

 