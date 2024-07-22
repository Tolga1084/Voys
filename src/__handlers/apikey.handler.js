"use strict"

const { UnauthorizedError } = require("../__helpers/errors")

const apiKey = async (req, res, next) => {
    try {
        if (req.path.startsWith('/admin')) {
            if (req.headers.authorization && req.headers.authorization === ("webApiKey" + process.env.WEB_API_KEY)) {
           
                return next()
            }
            throw new UnauthorizedError("Unauthorized! Invalid admin api key.")
        } else {
            if (req.headers.authorization && req.headers.authorization === ("apiKey" + process.env.API_KEY)) {
                return next()
            }
            throw new UnauthorizedError("Unauthorized! Invalid api key.")
        }
    } catch (error) {
        next(error)
    }
}

module.exports = apiKey
