"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const UserRole = sequelize.define("user_roles", {
    userRoleId: {
        field: "user_role_id",
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
    roleId: {
        field: "role_id",
        type: Sequelize.INTEGER,
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
        },
        schema: "admin"
    }
)

module.exports = UserRole
