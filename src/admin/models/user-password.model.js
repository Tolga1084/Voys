"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const UserPassword = sequelize.define("user_passwords", {
    passwordId: {
        field: "password_id",
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
    userId: {
        field: "user_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    password: {
        field: "password",
        type: Sequelize.STRING(64),
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
        where: { "is_deleted": false },
        attributes: { exclude: ["is_deleted"] }
    },
    schema: "admin"
})

module.exports = UserPassword