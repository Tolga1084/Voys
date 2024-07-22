"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const NotificationTemplates = sequelize.define("notification_templates", {
    templateId: {
        field: "template_id",
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
    templateName: {
        field: "template_name",
        type: Sequelize.STRING,
        allowNull: false
    },
    title: {
        field: "title",
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        field: "body",
        type: Sequelize.STRING,
        allowNull: false
    },
    priority: {
        field: "priority",
        type: Sequelize.STRING
    },
    timeToLive: {
        field: "time_to_live",
        type: Sequelize.INTEGER
    },
    channelId: {
        field: "channel_id",
        type: Sequelize.TEXT,
        allowNull: false
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

module.exports = NotificationTemplates