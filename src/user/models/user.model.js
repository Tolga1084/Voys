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
        defaultValue: false
    },
    username: {
        field: "username",
        type: Sequelize.STRING(64),
        allowNull: false
    },
    fullName: {
        field: "full_name",
        type: Sequelize.STRING(255),
        allowNull: false
    },
    email: {
        field: "email",
        type: Sequelize.STRING(255),
        allowNull: false
    },
    phone: {
        field: "phone",
        type: Sequelize.STRING(16),
        allowNull: false
    },
    isFirstResponder: {
        field: "is_first_responder",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createOn: {
        field: "create_on",
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updateOn: {
        field: "update_on",
        type: Sequelize.DATE
    }
},
    
    {
        timestamps: false,
        defaultScope: {
            where: { isDeleted: false },
            attributes: { exclude: ["isDeleted"] }
        },
        hooks: {
               beforeUpdate: (user, options) => {
                   user.updateOn = new Date();
               }
        }
    
    }
)

module.exports = User