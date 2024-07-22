"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const Device = sequelize.define("devices", {
    deviceId: {
        field: "device_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        field: "user_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    isLogin: {
        field: "is_login",
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    deviceBrand: {
        field: "device_brand",
        type: Sequelize.STRING(255),
        allowNull: false
    },
    deviceModel: {
        field: "device_model",
        type: Sequelize.STRING(255),
        allowNull: false
    },
    osVersion: {
        field: "os_version",
        type: Sequelize.STRING(10),
        allowNull: false
    },
    appVersion: {
        field: "app_version",
        type: Sequelize.STRING(10),
        allowNull: false
    },
    firebaseToken: {
        field: "firebase_token",
        type: Sequelize.STRING(255)
    },
    createOn: {
        field: "create_on",
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    DeviceInfoUpdateOn: {
        field: "device_info_update_on",
        type: Sequelize.DATE
    },
    lastLogin: {
        field: "last_login",
        type: Sequelize.DATE
    },
    lastLogout: {
        field: "last_logout",
        type: Sequelize.DATE
    }
}, { timestamps: false,
        hooks: {
            beforeUpdate: (device) => {
                if (device.isLogin) {
                    // If isLogin is true, update lastLogin
                    device.lastLogin = new Date()
                } else {
                    // If isLogin is false, update lastLogout
                    device.lastLogout = new Date()
                }
        
                // Check if deviceBrand, deviceModel, osVersion, or appVersion has been changed
                if (device.changed('deviceBrand') || device.changed('deviceModel') || device.changed('osVersion') || device.changed('appVersion')) {
                    device.DeviceInfoUpdateOn = new Date()
                }
            }
        }
    }
)

module.exports = Device