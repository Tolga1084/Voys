"use strict"

const User = require("../user/user.service")
const UserFollower = require("../user-follower/user-follower.service")
const Notification = require("../notification/notification.service")
const Device = require("../device/device.service")
const Incident = require("../incident/incident.service")
const { ClientError } = require("../__helpers/errors")
const { responderStatus: ResponderStatus } = require("../incident/enums")
const { alertSlack } = require("../__helpers/slack-hook")


const incidentAlert = async ({ userId, senderDeviceId, coordinates, incidentType, address, reportSource }) => {

    const incident = await Incident.create({
        userId,
        deviceId: senderDeviceId,
        coordinates,
        address,
        incidentType: Incident.Enums.incidentType[incidentType],
        reportSource: Incident.Enums.reportSource[reportSource]
    })

    const [ sender, senderDevice, followeeUserIds, firstResponderIds ] = await Promise.all([
        User.detail({ query: { userId }}),
        Device.detail({ query: { deviceId: senderDeviceId }}),
        UserFollower.getFollowUserIds({ userId, type: 'followee' }),
        User.getFirstResponderIds()
    ])

    sender.device = senderDevice

    const notificationType = "INCIDENT_ALERT"
    const mapsUrl = await Incident.getMapsUrl( coordinates )
    let messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{fullName}", sender.fullName)
    template.body = template.body.replace("{location}", mapsUrl)

    const jsonData = {
        notificationType,
        incidentId: incident.incidentId.toString()
    }

    const notifiedUsers = []

    // notify followees
    await Promise.all(followeeUserIds.map(async (receiverUserId) => {  
        try {

            await Incident.createIncidentResponder({ incidentId: incident.incidentId, userId: receiverUserId })

            const receiverDevice = await Device.getLatestDeviceByUser({ userId: receiverUserId })
            if (!receiverDevice)
                throw new Error("Device could not be found!")

            const firebaseResponse = await Notification.sendNotificationWithFireBase({
                ...template,
                firebaseToken: receiverDevice.firebaseToken,
                jsonData,
                logData: {
                    senderUserId: sender.userId,
                    senderDeviceId: sender.device.deviceId,
                    receiverUserId: receiverUserId,
                    receiverDeviceId: receiverDevice.deviceId,
                    type: messageType,
                    incidentId: incident.incidentId
                },
            })

            // todo: bug fix (isSent false but status becomes notified)
            if (firebaseResponse?.notificationMessage?.isSent)
                await Incident.updateResponderStatusByIncidentId({ incidentId: incident.incidentId, userId: receiverUserId, status: Incident.Enums.responderStatus.notified })

            notifiedUsers.push(receiverUserId)

        } catch (error) {
            console.log(error)
        }
    }))

    // remove followee user id from firstResponderIds to prevent duplicate notification
    const receiverUserIds = firstResponderIds.filter((id) => !followeeUserIds.includes(id))
    
    // notify first responders
    await Promise.all(receiverUserIds.map(async (receiverUserId) => {  
        try {
            const receiverDevice = await Device.getLatestDeviceByUser({ userId: receiverUserId })
            if (!receiverDevice)
                throw new Error("Device could not be found!")

            await Notification.sendNotificationWithFireBase({
                ...template,
                firebaseToken: receiverDevice.firebaseToken,
                jsonData,
                logData: {
                    senderUserId: sender.userId,
                    senderDeviceId: sender.device.deviceId,
                    receiverUserId: receiverUserId,
                    receiverDeviceId: receiverDevice.deviceId,
                    type: messageType,
                    incidentId: incident.incidentId,
                    isFirstResponderMessage: true
                },
            })

            notifiedUsers.push(receiverUserId)

        } catch (error) {
            console.log(error)
        }
    }))

    await Incident.update({ incidentId: incident.incidentId,
        notifiedUsers,
        status: Incident.Enums.incidentStatus.respondersNotified,
        responders: followeeUserIds
    })

    // notify slack
    alertSlack({ message: `${sender.fullName} kaza bildirdi` , code: "INCIDENT ALERT", info: `Incident ID: ${incident.incidentId}`, color: "#FF0000" })

    return { isSuccess: true }
}

const handleIncidentResponse = async ({ incidentId, responderUserId, response }) => {
    const [responders, firstResponderIds, caller] = await Promise.all([
        Incident.respondersInfoByIncidentId({ incidentId }),
        User.getFirstResponderIds(),
        Incident.getCallerByIncidentId({ incidentId })
    ])

    const responder = responders.find((responder) => responder.userId === responderUserId)

    if (!responder)
        throw new ClientError("Responder not found!", "RESPONDER_NOT_FOUND")

    const callerInfo = await User.detail({ query: { userId: caller.userId }})

    let notificationType
    switch(response) {
        case 'accepted':
            await Incident.sendIncidentResponder({ incidentId, userId: responderUserId })
            notificationType = "RESPONDER_ENROUTE"
            break
        case 'rejected':
            const { status } = await Incident.recallIncidentResponder({ incidentId, userId: responderUserId })
            if (status === Incident.Enums.responderStatus.enroute)
                notificationType = "RESPONDER_ENROUTE_CANCELLED"
            else
                notificationType = "RESPONDER_REJECTED_INCIDENT_CALL"
            break
        case 'onScene':
            await Incident.responderOnScene({ incidentId, userId: responderUserId })
            notificationType = "RESPONDER_ON_SCENE"
            break
        default:
            throw new Error("Invalid response type")
    }

    const messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{responderFullName}", responder.fullName)
    template.body = template.body.replace("{callerFullName}", callerInfo.fullName)
    const jsonData = {
        notificationType,
        incidentId: incidentId.toString()
    }

    // notify responders except the clientUser who is responsing the call
    await Promise.all(responders.map(async (receiver) => {
        if (receiver.userId !== responderUserId) {
            try {
                await Notification.sendNotificationWithFireBase({
                    ...template,
                    firebaseToken: receiver.firebaseToken,
                    jsonData,
                    logData: {
                        senderUserId: responderUserId,
                        senderDeviceId: responder.deviceId,
                        receiverUserId: receiver.userId,
                        receiverDeviceId: receiver.deviceId,
                        type: messageType,
                        incidentId: incidentId
                    }
                })
            } catch (error) {
                console.log(error)
            }
        }
    }))

    // remove followee user id from firstResponderIds to prevent duplicate notification
    const receiverUserIds = firstResponderIds.filter((id) => !responders.some(responder => responder.userId === id))

    // notify first responders
    await Promise.all(receiverUserIds.map(async (receiverUserId) => {  
        try {
            const receiverDevice = await Device.getLatestDeviceByUser({ userId: receiverUserId })
            if (!receiverDevice)
                throw new Error("Device could not be found!")

            await Notification.sendNotificationWithFireBase({
                ...template,
                firebaseToken: receiverDevice.firebaseToken,
                jsonData,
                logData: {
                    senderUserId: responderUserId,
                    senderDeviceId: responder.deviceId,
                    receiverUserId: receiverUserId,
                    receiverDeviceId: receiverDevice.deviceId,
                    type: messageType,
                    incidentId,
                    isFirstResponderMessage: true
                }
            })

        } catch (error) {
            console.log(error)
        }
    }))

    // notify caller if the caller is not also first responder
    template.body = template.body.replace(callerInfo.fullName + " ", "")
    template.body = template.body.replace("adlı kullanıcının bulunduğu", "bulunduğunuz")
    if (!firstResponderIds.includes(caller.userId)) {
        try {
            const receiverDevice = await Device.getLatestDeviceByUser({ userId: caller.userId})
            if (!receiverDevice)
                throw new Error("Device could not be found!")
            
            await Notification.sendNotificationWithFireBase({
                ...template,
                firebaseToken: receiverDevice.firebaseToken,
                jsonData,
                logData: {
                    senderUserId: responderUserId,
                    senderDeviceId: responder.deviceId,
                    receiverUserId: caller.userId,
                    receiverDeviceId: caller.deviceId,
                    type: messageType,
                    incidentId
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    return { isSuccess: true }
}

// customised for client user
const incidentDetail = async ({ incidentId, clientUserId }) => {

    const incidentInfo = await Incident.incidentInfoByIncidentId({ incidentId })
    if (!incidentInfo)
        throw new ClientError("Incident not found!", "INCIDENT_NOT_FOUND")

    const ResponderStatus = Incident.Enums.responderStatus

    const actions = {
        accept: false,
        reject: false,
        onScene: false
    }

    incidentInfo.clientUser = {
        status: "first_responder"
    }

    if (incidentInfo.userId === clientUserId) {
        incidentInfo.clientUser.status = "caller"
    }

    incidentInfo.responders.forEach((responder, index) => {
        if (responder.userId === clientUserId) {
            incidentInfo.clientUser = "responder"
            incidentInfo.responder = responder

            switch (responder.responderStatusId) {
                case ResponderStatus.new:
                case ResponderStatus.notified:
                    actions.accept = true
                    actions.reject = true
                    break
                case ResponderStatus.rejected:
                case ResponderStatus.enrouteCancelled:
                    actions.accept = true
                    break
                case ResponderStatus.enroute:
                    actions.onScene = true
                    actions.reject = true
                    break
                case ResponderStatus.onScene:
                    break
            }
        }

        incidentInfo.responders[index] = {
            name: responder.fullName,
            accept: responder.responderStatusId === ResponderStatus.enroute,
            onScene: responder.responderStatusId === ResponderStatus.onScene
        }
    })

    incidentInfo.actions = actions

    return incidentInfo
}

const incidentNotificationPage = async ({ userId }) => {
    const user = await User.detail({ query: { userId }})

    let activeIncidentList = []
    if (user.isFirstResponder) 
        activeIncidentList = await Incident.getIncidentReports({ query: { isActive: true }})
    else
        activeIncidentList = await Incident.incidentListByResponderId({ userId })

    const incidentMessages = await Notification.getNotificationMessages({ query: { incidentId: activeIncidentList.map(incident => incident.incidentId), receiverUserId: userId}})

    // Create a map of messages by incidentId
    const messagesByIncidentId = incidentMessages.reduce((map, message) => {
        if (!map[message.incidentId]) {
            map[message.incidentId] = []
        }
        map[message.incidentId].push(message)
        return map
    }, {})

    // Attach messages to incidents
    activeIncidentList.forEach(incident => {
        incident.messages = messagesByIncidentId[incident.incidentId] || []
    })

    return activeIncidentList 
}

const cancelIncident = async ({ userId, incidentId }) => {

    const [responders, firstResponderIds, caller, callerInfo] = await Promise.all([
        Incident.respondersInfoByIncidentId({ incidentId }),
        User.getFirstResponderIds(),
        Incident.getCallerByIncidentId({ incidentId }),
        User.detail({ query: { userId }})
    ])

    await Incident.cancelIncident({ userId, incidentId })

    const notificationType = "INCIDENT_CANCELLED"

    const messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{fullName}", callerInfo.fullName)
    const jsonData = {
        notificationType,
        incidentId: incidentId.toString()
    }

    // notify responders
    await Promise.all(responders.map(async (receiver) => {
        try {
            await Notification.sendNotificationWithFireBase({
                ...template,
                firebaseToken: receiver.firebaseToken,
                jsonData,
                logData: {
                    senderUserId: caller.userId,
                    senderDeviceId: caller.deviceId,
                    receiverUserId: receiver.userId,
                    receiverDeviceId: receiver.deviceId,
                    type: messageType,
                    incidentId: incidentId
                }
            })
        } catch (error) {
            console.log(error)
        }
    }))

    // remove followee user id from firstResponderIds to prevent duplicate notification
    const receiverUserIds = firstResponderIds.filter((id) => !responders.some(responder => responder.userId === id))

    // notify first responders
    await Promise.all(receiverUserIds.map(async (receiverUserId) => {  
        try {
            const receiverDevice = await Device.getLatestDeviceByUser({ userId: receiverUserId })
            if (!receiverDevice)
                throw new Error("Device could not be found!")

            await Notification.sendNotificationWithFireBase({
                ...template,
                firebaseToken: receiverDevice.firebaseToken,
                jsonData,
                logData: {
                    senderUserId: caller.userId,
                    senderDeviceId: caller.deviceId,
                    receiverUserId: receiverUserId,
                    receiverDeviceId: receiverDevice.deviceId,
                    type: messageType,
                    incidentId,
                    isFirstResponderMessage: true
                }
            })

        } catch (error) {
            console.log(error)
        }
    }))

    return  { isSuccess: true }
}

module.exports = {
    incidentAlert, incidentDetail, handleIncidentResponse,
    incidentDetail, incidentNotificationPage, cancelIncident
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