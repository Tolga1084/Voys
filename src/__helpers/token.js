"use strict"

const crypto = require("crypto");

const createAuthToken = ({ data }) => {
    let payload = { 
        ...data,
        expire: new Date("2099-12-31"),
        time: new Date()
    }

    payload    = Buffer.from(JSON.stringify(payload)).toString("base64")
    let sha256 = crypto.createHash("sha256").update(payload + process.env.SECRET).digest("hex")
    sha256     = Buffer.from(sha256).toString("base64")
    
    return payload + "." + sha256
}

const checkAuthToken = ({ token }) => {
    try {
        token = token.split(".");

        let payload = JSON.parse(Buffer.from(token[0], "base64").toString())
        let sha256 = crypto.createHash("sha256").update(token[0] + process.env.SECRET).digest("hex")
        sha256     = Buffer.from(sha256).toString("base64")
        
        if (token[1] === sha256) 
            return payload
        else 
            return false
    } catch (error) {
        return false
    }
}
  
module.exports = {
    createAuthToken, checkAuthToken
}
