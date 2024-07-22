"use strict"

const User = require("../user/user.service")
const Incident = require("../incident/incident.service")
const Op = require('sequelize').Op

const getActiveUsers = async () => {
    return await User.all({ raw: true, where: { isActive: true }, order: [["userId", "DESC"]]})
}

const homePage = async () => {
    const [activeUserCount, activeUsers, incidentCountbyUserId, monthlyIncidentCount] = await Promise.all([
        User.count({ raw: true, where: { isActive: true } }),
        getActiveUsers(),
        Incident.countByUserId({ raw: true, where: { incidentStatus: { [Op.not]: Incident.Enums.incidentStatus.falsePositive } } }),
        Incident.getMonthlyCount()
    ])

    const totalIncidentCount = incidentCountbyUserId.reduce((total, incident) => total + parseInt(incident.count), 0)

    const incidentCountbyUser = incidentCountbyUserId.map(incident => {
        const matchingUser = activeUsers.find(user => user.userId === incident.userId)
        if (matchingUser) {
            return {
                username: matchingUser.username,
                incidentCount: incident.count
            }
        }
        return null
    }).filter(e => e !== null)

    return {
        activeUserCount,
        incidentCountbyUser,
        monthlyIncidentCount,
        totalIncidentCount
    };
};

const getIncidentReports = async ({ startDate, endDate }) => {
    return await Incident.getIncidentReports({ query: { createOn: { [Op.between]: [startDate, endDate] } } })
}

module.exports = {
    getActiveUsers, homePage, getIncidentReports
}

/*const updatePhone = async ({userId}, {phone}) => {
    let user = await User.findOne({where: {userId}, attributes: {phone}})
    if (!user)
        return null

    const oldPhone = user.phone

    if (oldPhone === phone)
        throw new ClientError("User already has this phone number!", "REDUNDANT_REQUEST")

    const phoneOwner = await User.findOne({where: {phone}, attributes: {userId}, raw: true})
    if (phoneOwner)
        throw new ClientError("The phone number has already been taken!", "DUPLICATE_PHONE")

    user = await user.update({phone})

    return {
        user: user.get({plain: true})
    }
}

const remove = async ({userId}) => {
    const user = await User.findOne({where: {userId}})
    if (!user)
        return null

    await user.update({
        isDeleted: true,
        username: ("anonymous-" + user.userId),
        phone: String(user.userId).padStart(10, "0"),
        fullName: "anonymous",
        email: "anonymous@anonymous",
        image: null
    })

    // ... Logout to all device
    await device.service.logoutUser({userId: user.userId})

    return {isSuccess: true}
}
 */