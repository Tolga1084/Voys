const validator = require('validator')
const { ClientError } = require("../__helpers/errors")

function defaultRegisterValidation ({ username, fullName, email, phone, password }) {
    // validation general
    if (fullName.length < 5)
        throw new ClientError("fullName must be at least 5 characters long!", "INVALID_FULL_NAME")

    if (!validator.isEmail(email))
        throw new ClientError("Please enter a valid e-mail!", "INVALID_EMAIL")

    validateUsername({username})

    validatePhone(phone)

    passwordValidator(password)
}

const passwordValidator = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/

    const isStrongPassword = strongPasswordRegex.test(password)

    if (!isStrongPassword)
        throw new ClientError("Password is not strong enough! It must contain at least one lowercase letter, one uppercase letter, one digit, one special character (@$!%*?&.), and be at least 8 characters long.", "INVALID_PASSWORD")
}

const validateUsername = ({username}) => {
    const illegalChars = /\W/ //... Letters, numbers and underscores are allowed

    // ... Validations
    if (username === "")
        throw new ClientError("Username is required", "MISSING_USERNAME")

    else if ((username.length < 3) || (username.length > 64))
        throw new ClientError("Username is out of bounds! Min: 3, Max: 64", "USERNAME_OUT_OF_BOUND")

    else if (illegalChars.test(username))
        throw new ClientError("Username contains illegal characters. Letters, numbers and underscores are allowed.", "USERNAME_ILLEGAL_CHARACTERS")
}

function validatePhone(phone) {
    if (!phone.startsWith("00000")) {
        if (!validator.isMobilePhone(phone, 'tr-TR') || phone[0]==0)
            throw new ClientError("Please enter a valid phone!", "INVALID_PHONE")
    }
}

module.exports = {
    defaultRegisterValidation, passwordValidator
}