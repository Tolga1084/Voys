"use strict"

const randomString = ({ length }) => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
    let randomString = ""

    for (let i = 0; i < length; i++) {
        let rnum = Math.floor(Math.random() * chars.length)
        randomString += chars.substring(rnum, rnum + 1)
    }

    return randomString
}

const randomStringNumber = ({ length }) => {
    const chars = "0123456789"
    let randomString = ""

    for (let i = 0; i < length; i++) {
        let rnum = Math.floor(Math.random() * chars.length)
        randomString += chars.substring(rnum,rnum+1)
    }

    return randomString
}

const guid = () => {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase()
}

const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) 
}

module.exports = {
    randomString,
    randomStringNumber,
    guid
}