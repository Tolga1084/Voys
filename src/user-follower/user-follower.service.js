"use strict"

const { UserFollower, FollowRequests } = require("./models")
const { User } = require("../user/models")
const { Op } = require('sequelize')

UserFollower.belongsTo(User, { as: 'Follower', foreignKey: 'follower_id' })
UserFollower.belongsTo(User, { as: 'Followee', foreignKey: 'followee_id' })

FollowRequests.belongsTo(User, { as: 'Sender', foreignKey: 'sender_user_id' })
FollowRequests.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_user_id' })


// ... USER FOLLOWER

const createFollower = async ({ followeeId, followerId }, options = {}) => {
    const userFollower = await UserFollower.create({
        followeeId,
        followerId
    }, options)

    return userFollower.get({plain: true})
}

const removeFollow = async ({ userFollowerId }) => {
    return await UserFollower.update({ isDeleted: true }, { where: { userFollowerId }})
}

const getUserFollower = async ({ userFollowerId, query }) => {
    const users = await UserFollower.findOne({ raw: true, where: { userFollowerId, ...query }, order: [["userFollowerId", "DESC"]]})

    return users
}

const getUserFollowerByUserIds = async ({ followerId, followeeId }) => {
    const users = await UserFollower.findOne({ raw: true, where: { followerId, followeeId }, order: [["userFollowerId", "DESC"]]})

    return users
}

const getFollowUserIds = async ({ userId, type }) => {
    let whereCondition = {}
    let attributes = []

    if (type === 'follower') {
        attributes = ['followerId']
        whereCondition = { followeeId: userId }
    } else if (type === 'followee') {
        attributes = ['followeeId']
        whereCondition = { followerId: userId }
    }

    let follows = await UserFollower.findAll({
        where: whereCondition,
        attributes,
        raw: true
    })

    const followUserIds = follows.map(follow => follow[attributes[0]])

    return followUserIds
}

const getFollowsWithDetail = async ({ userId, type }) => {
    const attributes = ['username', 'fullName', 'phone', 'email']
    let whereCondition = {}
    let includeCondition = {}

    if (type === 'follower') {
        whereCondition = { followeeId: userId }
        includeCondition = { model: User, as: 'Follower', attributes }
    } else if (type === 'followee') {
        whereCondition = { followerId: userId }
        includeCondition = { model: User, as: 'Followee', attributes }
    }

    let followsWithDetail = await UserFollower.findAll({
        where: whereCondition,
        include: includeCondition,
        attributes: ['userFollowerId'],
        raw: false
    })

    if (followsWithDetail.length === 0)
        return null

    followsWithDetail = followsWithDetail.map(follow => {
        const user = type === 'follower' ? follow.Follower : follow.Followee
        return { userFollowerId: follow.userFollowerId, ...user.dataValues }
    })

    return followsWithDetail
}


// ... FOLLOW REQUEST

const createFollowRequest = async ({
                                    senderUserId,
                                    senderDeviceId,
                                    receiverUserId,
                                    receiverDeviceId,
                                    notificationMessageId,
                                    response,
                                    isActive = true
                                }, options = {}) => {

    const followRequest = await FollowRequests.create({
        senderUserId,
        senderDeviceId,
        receiverUserId,
        receiverDeviceId,
        notificationMessageId,
        response,
        isActive
    }, options)

    return followRequest.get({plain: true})
}

const updateFollowRequest = async ({ followRequestId, notificationMessageId, isAccepted, responseDate, responseNotificationMessageId, isDeleted, isActive }, options = {}) => {
    const followRequest = await FollowRequests.update({
        notificationMessageId,
        isAccepted,
        isDeleted,
        responseDate,
        isActive,
        responseNotificationMessageId
    }, {
        where: { followRequestId },
        ...options
    })
}

const getFollowRequest = async ({ query }) => {

    const followRequest = await FollowRequests.findOne({ raw: true, where: { ...query }})
    if (!followRequest)
        return null

    return followRequest
    
}

const getFollowRequestsWithDetail = async ({ userId, type }) => {

    const attributes = ['username', 'phone']
    
    let whereCondition = {}
    let includeCondition = {}

    if (type === 'follower') {
        whereCondition = { receiverUserId: userId }
        includeCondition = { model: User, as: 'Sender', attributes }
    } else if (type === 'followee') {
        whereCondition = { senderUserId: userId }
        includeCondition = { model: User, as: 'Receiver', attributes }
    }

    let followRequests = await FollowRequests.findAll({
        where: whereCondition,
        include: includeCondition,
        attributes: ['followRequestId'],
        raw: false
    })

    if (followRequests.length === 0)
        return []

    followRequests = followRequests.map(request => {
        const user = type === 'follower' ? request.Sender : request.Receiver
        return { followRequestId: request.followRequestId, ...user.dataValues }
    })

    return followRequests
}

const getFolloweeCount = async ({ userId }) => {
    const followeeCount = await UserFollower.count({ raw: true, where: { followerId: userId }})

    return followeeCount
}

const getOnlyFollowRequestCount = async ({ userId }) => {
    const followRequestCount = await FollowRequests.count({ raw: true, where: { senderUserId: userId, isActive: true }})

    return followRequestCount
}

const getFollowRequestCount = async ({ userId }) => {
    const followRequestCount = await FollowRequests.count({ raw: true, where: { [Op.or]: [{ receiverUserId: userId }, { senderUserId: userId }], isActive: true }})
    
    return followRequestCount
}



module.exports = {
    createFollower, removeFollow, getFollowUserIds, getFollowsWithDetail,
    getUserFollowerByUserIds, getUserFollower, createFollowRequest, updateFollowRequest,
    getFollowRequest, getFollowRequestsWithDetail, getFollowRequestCount, getFolloweeCount, getOnlyFollowRequestCount
}