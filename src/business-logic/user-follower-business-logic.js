"use strict"

const User = require("../user/user.service")
const UserFollower = require("../user-follower/user-follower.service")
const Notification = require("../notification/notification.service")
const Device = require("../device/device.service")
const { ClientError } = require("../__helpers/errors")
const sequelize = require('../__helpers/connection')

// sender is the requesting user, receiver is the responding user.
const sendFollowRequest = async ({ sender, receiver }) => {
    receiver = await User.detail({ query: { username: receiver.username, phone: receiver.phone }})
    if (!receiver)
        throw new ClientError("User does not exist!", "INVALID_REQUEST")

    if (receiver.userId === sender.userId)
        throw new ClientError("Users cant add themselves as emergency contact!", "INVALID_REQUEST")

    const [existingUserFollower, existingFollowRequest, followeeCount, followRequestCount, receiverDevice] = await Promise.all([
        UserFollower.getUserFollowerByUserIds({ followerId: sender.userId, followeeId: receiver.userId }),
        UserFollower.getFollowRequest({ query: { senderUserId: sender.userId, receiverUserId: receiver.userId } }),
        UserFollower.getFolloweeCount({ userId: sender.userId }),
        UserFollower.getOnlyFollowRequestCount({ userId: sender.userId }),
        Device.getLatestDeviceByUser({ userId: receiver.userId })
    ])

    if (existingUserFollower)
        throw new ClientError("User is already followed by you!", "INVALID_REQUEST")

    if (existingFollowRequest)
        throw new ClientError("You already have an active request to follow this user!", "INVALID_REQUEST")

    if (followeeCount + followRequestCount >= 3)
        throw new ClientError("You can only follow 3 users at a time!", "INVALID_REQUEST")

    if (!receiverDevice)
        throw new Error("Device could not be found!")

    receiver.device = receiverDevice;
    
    const senderDeviceId = sender.deviceId
    sender = await User.detail({ query: { userId: sender.userId }})
    if (!sender)
        return null

    const followRequest = await UserFollower.createFollowRequest({
        senderUserId: sender.userId,
        senderDeviceId: senderDeviceId,
        receiverUserId: receiver.userId,
        receiverDeviceId: receiver.device.deviceId,
        isActive: true
    })

    const notificationType = "FOLLOW_REQUEST"

    const jsonData = {
        followRequestId: followRequest.followRequestId.toString(),
        username: sender.username,
        fullName: sender.fullName,
        phone: sender.phone,
        userId: sender.userId.toString(),
        notificationType
    }

    const messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{username}", sender.username)
    
    try {
        const { response, notificationMessage } = await Notification.sendNotificationWithFireBase({
            ...template,
            jsonData,
            firebaseToken: receiver.device.firebaseToken,
            logData: {
                senderUserId: sender.userId,
                senderDeviceId: senderDeviceId,
                receiverUserId: receiver.userId,
                receiverDeviceId: receiver.device.deviceId,
                type: messageType
            },
        })

        await UserFollower.updateFollowRequest({ followRequestId: followRequest.followRequestId, notificationMessageId: notificationMessage.notificationMessageId })

    } catch (error) {
        console.log(error)
    }

    return { isSuccesful: true }
}

// sender is the requesting user, receiver is the responding user. ReceiverId is needed to confirm with token.
const followRequestResponse = async ({ receiverUserId, receiverDeviceId, followRequestId, isAccepted }) => {

    const followRequest = await UserFollower.getFollowRequest({ query: { followRequestId, receiverUserId, isActive: true }})
    if (!followRequest)
        throw new ClientError("followRequest could not be found!", "INVALID_REQUEST")

    const [receiver, sender, senderDevice] = await Promise.all([
        User.detail({ query: { userId: followRequest.receiverUserId } }),
        User.detail({ query: { userId: followRequest.senderUserId } }),
        Device.getLatestDeviceByUser({ userId: followRequest.senderUserId })
    ])

    sender.device = senderDevice
    
    const notificationType = "FOLLOW_REQUEST_RESPONSE"
    const messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{username}", receiver.username)

    // to-do: send notification to receiver to inform about the response
    if(isAccepted) {
        await UserFollower.createFollower({ followeeId: followRequest.receiverUserId, followerId: followRequest.senderUserId })

        template.body = template.body.replace("{isAccepted}", "kabul etti")

    }
    else {
        template.body = template.body.replace("{isAccepted}", "reddetti")
    }

    await UserFollower.updateFollowRequest({ followRequestId: followRequest.followRequestId, isAccepted, responseDate: new Date(), isActive: false })

    // receiver and sender are switched because the response is sent to the sender
    const { notificationMessage } = await Notification.sendNotificationWithFireBase({
        ...template,
        firebaseToken: sender.device.firebaseToken,
        jsonData: {
            notificationType
        },
        logData: {
            senderUserId: receiver.userId,
            senderDeviceId: receiverDeviceId,
            receiverUserId: sender.userId,
            receiverDeviceId: sender.device.deviceId,
            type: messageType
        },
    })

    await UserFollower.updateFollowRequest({ followRequestId: followRequest.followRequestId, responseNotificationMessageId: notificationMessage.notificationMessageId })

    return { isSuccesful: true }
}

const getActiveFollowRequests = async ({ userId }) => {
    const [receivedFollowRequests, sentFollowRequests] = await Promise.all([
        UserFollower.getFollowRequestsWithDetail({ userId, type: 'follower' }),
        UserFollower.getFollowRequestsWithDetail({ userId, type: 'followee' })
    ])

    if (!receivedFollowRequests && !sentFollowRequests) {
        return null
    }

    const FollowRequests = {
        received: receivedFollowRequests,
        sent: sentFollowRequests
    }

    return FollowRequests
}

// ... cancelled by follower
const removeFollowee = async ({ userId, senderDeviceId, userFollowerId }) => {
    const userFollower = await UserFollower.getUserFollower({ userFollowerId, query: { followerId: userId }}) // query is used for security. userFollowerId is sufficient to find the userFollower
    if (!userFollower)
        throw new ClientError("UserFollower could not be found!", "INVALID_REQUEST")

    const [follower, followee, followeeDevice] = await Promise.all([
        User.detail({ query: { userId: userFollower.followerId }}),
        User.detail({ query: { userId: userFollower.followeeId }}),
        Device.getLatestDeviceByUser({ userId: userFollower.followeeId })
    ])

    followee.device = followeeDevice

    await UserFollower.removeFollow({ userFollowerId: userFollower.userFollowerId })

    const notificationType = "FOLLOWER_CANCEL"
    const messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{username}", follower.username)

    await Notification.sendNotificationWithFireBase({
        ...template,
        firebaseToken: followee.device.firebaseToken,
        jsonData: {
            notificationType,
        },
        logData: {
            senderUserId: follower.userId,
            senderDeviceId,
            receiverUserId: followee.userId,
            receiverDeviceId: followee.device.deviceId,
            type: messageType
        },
    })

    return { isSuccesful: true }
}

// ... cancelled by followee
const removeFollower = async ({ userId, senderDeviceId, userFollowerId }) => {
    const userFollower = await UserFollower.getUserFollower({ userFollowerId, query: { followeeId: userId }})
    if (!userFollower)
        throw new ClientError("UserFollower could not be found!", "INVALID_REQUEST")

    const [follower, followee, followerDevice] = await Promise.all([
        User.detail({ query: { userId: userFollower.followerId }}),
        User.detail({ query: { userId: userFollower.followeeId }}),
        Device.getLatestDeviceByUser({ userId: userFollower.followerId })
    ])

    follower.device = followerDevice

    await UserFollower.removeFollow({ userFollowerId: userFollower.userFollowerId })

    // ... cancelled by followee
    const notificationType = "FOLLOWEE_CANCEL"
    const messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{username}", followee.username)

    await Notification.sendNotificationWithFireBase({
        ...template,
        firebaseToken: follower.device.firebaseToken,
        jsonData: {
            notificationType,
        },
        logData: {
            senderUserId: followee.userId,
            senderDeviceId,
            receiverUserId: follower.userId,
            receiverDeviceId: follower.device.deviceId,
            type: messageType
        },
    })

    return { isSuccesful: true }
}

const cancelFollowRequest = async ({ userId, senderDeviceId, followRequestId }) => {
    const followRequest = await UserFollower.getFollowRequest({ query: { followRequestId, senderUserId: userId, isActive: true }})
    if (!followRequest)
        throw new ClientError("followRequest could not be found!", "INVALID_REQUEST")

    const [receiver, sender, receiverDevice ] = await Promise.all([
        User.detail({ query: { userId: followRequest.receiverUserId }}),
        User.detail({ query: { userId: followRequest.senderUserId }}),
        Device.getLatestDeviceByUser({ userId: followRequest.receiverUserId })
    ])

    receiver.device = receiverDevice

    await UserFollower.updateFollowRequest({ followRequestId, isDeleted: true })

    const notificationType = "FOLLOW_REQUEST_CANCEL"
    const messageType = Notification.Enums.messageType[notificationType]
    let template = await Notification.getFirebaseNotificationTemplate({ query: { templateId: messageType }})
    template.body = template.body.replace("{username}", sender.username);

    await Notification.sendNotificationWithFireBase({
        ...template,
        firebaseToken: receiver.device.firebaseToken,
        jsonData: {
            notificationType,
        },
        logData: {
            senderUserId: sender.userId,
            senderDeviceId,
            receiverUserId: receiver.userId,
            receiverDeviceId: receiver.device.deviceId,
            type: messageType
        },
    })

    return { isSuccesful: true }
}

module.exports = {
    sendFollowRequest, followRequestResponse, getActiveFollowRequests, removeFollowee, removeFollower, cancelFollowRequest
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