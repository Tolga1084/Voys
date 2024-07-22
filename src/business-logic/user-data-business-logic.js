"use strict"

const UserData = require("../user-data/user-data.service")
const Device = require("../device/device.service")

const processSensorData = async ({ deviceId, sensorData }) => {

    const { userId, deviceBrand, deviceModel, osVersion, appVersion } = await Device.detail({ query: { deviceId }})

    const UID = userId
    const DID = deviceId
    const BM = `${deviceBrand} ${deviceModel}`
    const OS = osVersion[0]
    const APP = appVersion[0]

    const deviceStringified = JSON.stringify({ UID,DID,BM,OS,APP })

    UserData.saveSensorData({ deviceStringified, sensorData })
}

module.exports = {
    processSensorData
}
