"use strict"

const { HttpCode } = require("../__helpers/types")
const service = require("./user-follower.service") 
const { token } = require("../business-logic/authentication-business-logic") 
const UserFollower = require("../business-logic/user-follower-business-logic") 

const followUser = async (req, res, next) => {
    try {
        const userFollower = await service.createFollower({ followerId: req.payload.userId, userId: req.params.userId  })

        return res.status(HttpCode.CREATED).send(userFollower)
    } catch (error) {
        return next(error)
    }
}

const getFollowers = async (req, res, next) => {
    try {
        const followers = await service.getFollowsWithDetail({ userId: req.payload.userId, type: "follower" })
        if (!followers)
            return res.status(HttpCode.OK).send([])

        return res.status(HttpCode.OK).send(followers)
    } catch (error) {
        return next(error)
    }
}

const getFollowees = async (req, res, next) => {
    try {
        const followees = await service.getFollowsWithDetail({ userId: req.payload.userId, type: "followee" })
        if (!followees)
            return res.status(HttpCode.OK).send([])

        return res.status(HttpCode.OK).send(followees)
    } catch (error) {
        return next(error)
    }
}

const sendFollowRequest = async (req, res, next) => {
    try {
        const result = await UserFollower.sendFollowRequest({ sender: { userId: req.payload.userId, deviceId: req.payload.deviceId },
                                                        receiver: { username: req.body.username, phone: req.body.phone }})
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const followRequestResponse = async (req, res, next) => {
    try {
        const isAccepted = req.body.isAccepted === "true" ? true : req.body.isAccepted === "false" ? false : undefined;
        if (isAccepted === undefined) {
            return res.sendStatus(HttpCode.BAD_REQUEST);
        }
        const result = await UserFollower.followRequestResponse({ receiverUserId: req.payload.userId, receiverDeviceId: req.payload.deviceId,
                                                                       followRequestId: req.body.followRequestId, isAccepted })
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const getActiveFollowRequests = async (req, res, next) => {
    try {
        const result = await UserFollower.getActiveFollowRequests({ userId: req.payload.userId })
        if (!result)
            return res.status(HttpCode.OK)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const cancelFollowRequest = async (req, res, next) => {
    try {
        const result = await UserFollower.cancelFollowRequest({ userId: req.payload.userId, senderDeviceId: req.payload.deviceId,
                                                                followRequestId: req.params.followRequestId })
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.sendStatus(HttpCode.NO_CONTENT)
    } catch (error) {
        return next(error)
    }
}

const removeFollowee = async (req, res, next) => {
    try {
        const result = await UserFollower.removeFollowee({ userId: req.payload.userId, senderDeviceId: req.payload.deviceId,
                                                            userFollowerId: req.params.userFollowerId })
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.sendStatus(HttpCode.NO_CONTENT)
    } catch (error) {
        return next(error)
    }
}

const removeFollower = async (req, res, next) => {
    try {
        const result = await UserFollower.removeFollower({ userId: req.payload.userId, senderDeviceId: req.payload.deviceId,
                                                            userFollowerId: req.params.userFollowerId })
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.sendStatus(HttpCode.NO_CONTENT)
    } catch (error) {
        return next(error)
    }
}

/* const destroy = async (req, res, next) => {
    try {
        const result = await service.destroy({ userId: req.params.userId })
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.sendStatus(HttpCode.NO_CONTENT)
    } catch (error) {
        return next(error)
    }
}

const remove = async (req, res, next) => {
    try {
        const result = await User.remove({ userId: req.params.userId })
        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.sendStatus(HttpCode.NO_CONTENT)
    } catch (error) {
        return next(error)
    }
} */

module.exports = ({ router }) => {
    router.get("/followers", token, getFollowers)
    router.get("/followees", token, getFollowees)
    router.post("/follow-user", token, followUser)
    router.post("/follow-request", token, sendFollowRequest)
    router.post("/follow-request-response", token, followRequestResponse)
    router.delete("/follow-request/:followRequestId", token, cancelFollowRequest)
    router.delete("/followee/:userFollowerId", token, removeFollowee)
    router.delete("/follower/:userFollowerId", token, removeFollower)
    router.get("/active-follow-requests", token, getActiveFollowRequests)
    
    return router
}

module.exports.isRoot = false
