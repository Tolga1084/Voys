"use strict"

const User = require("../user/user.service")
const UserFollower = require("../user-follower/user-follower.service")
const Incident = require("../incident/incident.service")
const Notification = require("../notification/notification.service")

const profilePage = async ({ userId }) => {
    const user = await User.detail({ query: { userId }})
    const pendingRequestCount = await UserFollower.getFollowRequestCount({ userId })

    const profilePage = {
        user,
        pendingRequestCount
    }

    return profilePage
}

const updatePassword = async ({ userId, oldPassword, newPassword }) => {
    await User.updatePassword({ userId, oldPassword, newPassword })

    return { isSuccess: true }
}

const homePage = async ({ userId }) => {
    const [incident, activeIncidentCount] = await Promise.all([
        Incident.getActiveIncidentByUserId({ userId }),
        activeIncidentCountRelatedToClient({ userId })
    ])

    const homePage = {
        incident,
        activeIncidentCount
    }

    return homePage
}

const activeIncidentCountRelatedToClient = async ({ userId }) => {
    const user = await User.detail({ query: { userId }})

    let count = 0
    if (user.isFirstResponder) 
        count = await Incident.count({ query: { isActive: true }})
    else
        count = Incident.countIncidentsForResponder({ userId })

    return count
}

module.exports = {
    updatePassword, profilePage, homePage
}
