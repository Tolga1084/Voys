"use strict"

const Admin = require("firebase-admin")
const { ClientError } = require("../__helpers/errors")
const ServiceAccount = require("./service-account-firebase.json")
const { NotificationMessages, NotificationTemplates } = require("./models")
const FirebaseTimeToLiveDefault = 60 * 60 * 24 * 28 // 4 weeks in seconds
const Enums = require("./enums")

// Initialize the Firebase Admin SDK
Admin.initializeApp({
  credential: Admin.credential.cert(ServiceAccount)
})

// firebaseToken is the registration token
const sendNotificationWithFireBase = async ({ firebaseToken, title, body, channelId, jsonData, priority = "HIGH", timeToLive = FirebaseTimeToLiveDefault, logData }) => {
    
    if (!firebaseToken || !title || !body)
        throw new ClientError("firebaseToken, title and body is required!", "PARAMETER_EXCEPTION")

    const ttl = (timeToLive || FirebaseTimeToLiveDefault) * 1000 // convert seconds to milliseconds

    // ... Create payload
    const payload = {
        notification: {
            title,
            body
        },
        token: firebaseToken,
        data: jsonData,
        android: {
            priority,
            ttl,
            notification: {
                sound: Enums.channelSound[channelId],
                channelId
            }
        },
        apns: {
            headers: {
                'apns-priority': Enums.IosPriority[priority]
            },
            payload: {
                aps: {
                    sound: "default"
                }
            }
        }
    }

    const notificationMessage = await saveNotificationMessage({
        ...logData,
        jsonData,
        ttl,
        title,
        body,
        channelId
    })


    // ... Send message
    let response
    try {
        response = await Admin.messaging().send(payload)
    } catch (error) {
        notificationMessage.isSent = false,
        notificationMessage.jsonError = error.errorInfo ? error.errorInfo : error,
        await notificationMessage.save()

        console.error("Error sending notification:", error)
        return { response: error, notificationMessage }
    }

    notificationMessage.isSent = true,
    await notificationMessage.save()
    
    return { response, notificationMessage }
}

const getFirebaseNotificationTemplate = async ({ query }) => {
    return await NotificationTemplates.findOne({ raw:true, where: { ...query }})
}

const saveNotificationMessage = async ({
                                        receiverUserId,
                                        receiverDeviceId,
                                        senderUserId,
                                        senderDeviceId,
                                        templateId,
                                        title,
                                        body,
                                        jsonData,
                                        ttl,
                                        type,
                                        triggerDate,
                                        incidentId,
                                        channelId,
                                        isActive = true
                                    }, options = {}) => {

    const notificationMessage = await NotificationMessages.create({
        receiverUserId,
        receiverDeviceId,
        senderUserId,
        senderDeviceId,
        templateId,
        title,
        body,
        jsonData,
        ttl,
        type,
        triggerDate,
        isActive,
        incidentId,
        channelId
    }, options)

    return notificationMessage
}

const getNotificationMessages = async ({ query }) => {
    return await NotificationMessages.findAll({ raw: true, where: { ...query }, order: [["notificationMessageId", "DESC"]]})
}

module.exports = {
   sendNotificationWithFireBase, getFirebaseNotificationTemplate, saveNotificationMessage, Enums, getNotificationMessages
}
