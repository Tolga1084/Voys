"use strict"

const IosPriority = {
    HIGH: '10',
    NORMAL: '5'
}

const messageType = {
    TEST_TEMPLATE: 999,
    INCIDENT_ALERT: 911,
    RESPONDER_REJECTED_INCIDENT_CALL: 913,
    RESPONDER_ENROUTE_CANCELLED: 919,
    RESPONDER_ENROUTE: 920,
    RESPONDER_ON_SCENE: 930,
    INCIDENT_CANCELLED: 980,
    FOLLOW_REQUEST: 1,
    FOLLOW_REQUEST_RESPONSE: 2,
    FOLLOW_REQUEST_CANCEL: 3,
    FOLLOWER_CANCEL: 4, // when a follower unfollows a followee
    FOLLOWEE_CANCEL: 5 // when a followee unfollows a follower
}

const channelSound = {
    1: "normal",
    2: "normal",
    3: "crash"
}

module.exports = {
    IosPriority,
    messageType,
    channelSound
}