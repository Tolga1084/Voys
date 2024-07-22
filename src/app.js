"use strict"

const appPackage = require("../package.json")
const express = require("express")
const fs = require("fs")
const path = require("path")
const error = require("./__handlers/error.handler")
const apiKey = require("./__handlers/apikey.handler")
const cors = require("cors")

const app = express()

// serve ssl verification (also need to disable apiKey, configure nginx and aws firewall )
//app.use('/.well-known', express.static(path.join(__dirname, '../.well-known')));

app.use(cors({
    origin: ['https://www.voyssai.com', 'http://localhost:3000'] // admin panel url and localhost
  }))


// ... Config
app.use(express.json({ limit: '10mb' }))

// ... Global authentication
app.use(apiKey)

// ... Headers
app.use((req, res, next) => {
    res.set({
        "application-name": appPackage.name,
        "application-version": appPackage.version,
        "application-author": appPackage.author,
        "x-powered-by": "Voys application server"
    })

    next()
})

// ... Ping
app.use("/ping", (req, res) => { res.send({ message: "Everything is perfect 🚀" }) })

// ... Define api route and import service
const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
let root
for (const dir of dirs("./src"))
    if (dir[0] !== "_" && dir !== "business-logic") {
        const dirController = require("./" + dir)
        if (dirController.controller.isRoot) {
            root = dirController.controller({ router: express.Router() })
            console.log("Root controller -> /" + dir)
        }
        else {
            app.use("/" + dir, dirController.controller({ router: express.Router() }))
            console.log("Initialized controller -> /" + dir)
        }
    }

app.use("/", root)

// ... Global error handler
app.use(error)

module.exports = app
