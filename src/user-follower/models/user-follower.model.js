"use strict"

const Sequelize = require("sequelize")
const sequelize = require("../../__helpers/connection")

const UserFollower = sequelize.define("user_follower", {
    userFollowerId: {
        field: "user_follower_id",
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
    followeeId: {
        field: "followee_id",
        type: Sequelize.INTEGER,
        allowNull: false
    },
    followerId: {
        field: "follower_id",
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
        where: { "is_deleted": false },
        attributes: { exclude: ["is_deleted"] }
    }
})

module.exports = UserFollower