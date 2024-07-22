"use strict"

const Incident = require("./incident.model")
const VW_monthly_incident_report = require("./vw_monthly_incident_report.model")
const VW_incident_report = require("./vw_incident_report.model")
const IncidentResponder = require("./incident-responder.model")
const IncidentStatusHistory = require("./incident-status-history.model")
const VW_responder_info = require("./vw_responder_info.model")

module.exports = {
    Incident, VW_monthly_incident_report, VW_incident_report,
    IncidentResponder, IncidentStatusHistory, VW_responder_info
}