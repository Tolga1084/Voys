"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const NotificationMessages = sequelize.define("notification_messages", {
    notificationMessageId: {
        field: "notification_message_id",
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    isActive: {
        field: "is_active",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    isDeleted: {
        field: "is_deleted",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    title: {
        field: "title",
        type: Sequelize.STRING
    },
    body: {
        field: "body",
        type: Sequelize.STRING
    },
    channelId: {
        field: "channel_id",
        type: Sequelize.TEXT,
        allowNull: false
    },
    jsonData: {
        field: "json_data",
        type: Sequelize.JSON
    },
    ttl: {
        field: "ttl",
        type: Sequelize.STRING
    },
    type: {
        field: "type",
        type: Sequelize.SMALLINT
    },
    incidentId: {
        field: "incident_id",
        type: Sequelize.INTEGER
    },
    triggerDate: {
        field: "trigger_date",
        type: Sequelize.DATE
    },
    isSent : {
        field: "is_sent",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    jsonError: {
        field: "json_error",
        type: Sequelize.JSON
    },
    isFirstResponderMessage: {
        field: "is_first_responder_message",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
            where: { isDeleted: false },
            attributes: { exclude: ["isDeleted"] }
        }
    })

module.exports = NotificationMessages
