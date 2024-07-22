"use strict"

const { HttpCode } = require("../__helpers/types")
const service = require("./user.service") 
const { token, adminToken } = require("../business-logic/authentication-business-logic") 
const User = require("../business-logic/user-business-logic")

const all = async (req, res, next) => {
    try {
        const users = await service.all({ query: req.query })

        return res.status(HttpCode.OK).send(users)
    } catch (error) {
        return next(error)
    }
}

const me = async (req, res, next) => {
    try {
        const user = await service.detail({ query: { userId: req.payload.userId }})

        if (!user)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(user)
    } catch (error) {
        return next(error)
    }
}

const profilePage = async (req, res, next) => {
    try {
        const profilePage = await User.profilePage({ userId: req.payload.userId })

        if (!profilePage)
            return res.sendStatus(HttpCode.NOT_FOUND)
        
        return res.status(HttpCode.OK).send(profilePage)
    }
    catch (error) {
        return next(error)
    }
}

const detail = async (req, res, next) => {
    try {
        const user = await service.detail({ query: { userId: req.params.userId }})

        if (!user)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(user)
    } catch (error) {
        return next(error)
    }
}

const create = async (req, res, next) => {
    try {
        const user = await service.create({ ...req.body })

        return res.status(HttpCode.CREATED).send(user)
    } catch (error) {
        return next(error)
    }
}

const update = async (req, res, next) => {
    try {
        const user = await service.update({ userId: req.params.userId }, { ...req.body })

        if (!user)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(user)
    } catch (error) {
        return next(error)
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const result = await User.updatePassword({ userId: req.payload.userId, newPassword: req.body.newPassword,
                                                        oldPassword: req.body.oldPassword })

        if (!result)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(result)
    } catch (error) {
        return next(error)
    }
}

const homePage = async (req, res, next) => {
    try {
        const homePage = await User.homePage({ userId: req.payload.userId })

        if (!homePage)
            return res.sendStatus(HttpCode.NOT_FOUND)

        return res.status(HttpCode.OK).send(homePage)
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
    router.post("/", create)
    router.get("/me", token, me)
    router.get("/profile-page", token, profilePage)
    router.get("/home-page", token, homePage)
    router.post("/update-password", token, updatePassword )

    /*
    router.delete("/:userId", remove)
    router.delete("/destroy/:userId", destroy)
    */

    return router
}

module.exports.isRoot = true
