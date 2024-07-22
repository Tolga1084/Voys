"use strict"

const axios = require("axios")

// ... Globals
const url = "https://hooks.slack.com/services/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"
const headers = {
    "Content-Type": "application/json"
}

const alertSlack = async ({ message, code, info, color = "#FF0000" }) => {

    const payload = {
        attachments: [{
            title: code,
            text:  message + "\n" + info,
            color
        }]
      }

    try {
        const result = await axios({
            headers,
            method: "POST",
            url,
            data: payload
        })

        return result.data
    } catch (error) {
        console.log("Could not send Slack notification! \n" + error)
    }
}

module.exports = {
    alertSlack
}
