const mongoose = require('mongoose')
const { userSchema } = require('../Schema/UserSchema')

const User_Model = mongoose.model('UserRegister', userSchema)

module.exports = {
    User_Model
}