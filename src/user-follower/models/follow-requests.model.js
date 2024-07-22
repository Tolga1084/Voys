"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const FollowRequests = sequelize.define("follow_requests", {
    followRequestId: {
        field: "follow_request_id",
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
    senderUserId: {
        field: "sender_user_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    senderDeviceId: {
        field: "sender_device_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    receiverUserId: {
        field: "receiver_user_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    receiverDeviceId: {
        field: "receiver_device_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    notificationMessageId: {
        field: "notification_message_id",
        type: Sequelize.INTEGER,
        allowNull: true
    },
    responseNotificationMessageId: {
        field: "response_notification_message_id",
        type: Sequelize.INTEGER,
        allowNull: true
    },
    responseDate: {
        field: "response_date",
        type: Sequelize.DATE
    },
    isAccepted: {
        field: "is_accepted",
        type: Sequelize.BOOLEAN
    },
    createOn: {
        field: "create_on",
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
},
    {
        timestamps: false,
        defaultScope: {
            where: { isDeleted: false, isActive: true },
            attributes: { exclude: ["isDeleted"] }
        }
    })

module.exports = FollowRequests
