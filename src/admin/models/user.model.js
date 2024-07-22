"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const User = sequelize.define("users", {
    userId: {
        field: "user_id",
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
    username: {
        field: "username",
        type: Sequelize.STRING(64),
        allowNull: false
    },
    createOn: {
        field: "create_on",
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    isLogin: {
        field: "is_login",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
},
    {
        timestamps: false,
        defaultScope: {
            where: { isDeleted: false },
            attributes: { exclude: ["isDeleted"] }
        },
        schema: "admin"
    }
)

module.exports = User