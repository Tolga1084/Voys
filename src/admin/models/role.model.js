"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const Role = sequelize.define("roles", {
    roleId: {
        field: "role_id",
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
    role: {
        field: "role",
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
            where: { isDeleted: false, isActive: true },
            attributes: { exclude: ["isDeleted"] }
        },
        schema: "admin"
    }
)

module.exports = Role
