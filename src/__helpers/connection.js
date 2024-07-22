"use strict"
const Sequelize = require("sequelize")
const dbName = process.env.DB_NAME

const postgres = new Sequelize(dbName, null, null, {
    dialect: "postgres",
    dialectOptions: { 
        decimalNumbers: true,
        encrypt: true,
        ssl : {
            rejectUnauthorized: false
        }
    },
    operatorsAliases: 0,
    logging: false,
    replication: {
        read: [
            {
                host: process.env.R_DB_HOST,
                username: process.env.R_DB_USERNAME,
                password: process.env.R_DB_PASSWORD
            }
        ],
        write: { 
            host: process.env.W_DB_HOST,
            username: process.env.W_DB_USERNAME,
            password: process.env.W_DB_PASSWORD
        }
    },
    port: 5432,
    define: {
        freezeTableName: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            }
        }
    }
})

module.exports = postgres
