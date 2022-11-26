const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require("bcrypt")

const userSchema = new Schema({
    userType: {
        type: String,
        enum: [ 'GUEST','NORMAL', 'PREMIUM', 'ADMIN'],
        default: 'GUEST',
        required: true,
    },
    // firstName:{
    //     type:String,
    //     default:''
    // },
    name: {
        type: String,
        required: [true, 'user Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: true,
        validate: {
            validator: function (e) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e)
            },
            message: 'Incorrect email Format'
        },
    },
    password: {
        type: String,
        required: [true, "password is required"],
        //select: false,
        minlength: 8,
        validate: {
            validator: function (v) {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/.test(v)
            },
            message: "password should contain atleast one number and one special character"
        }
    },
    confirmPassword: {
        type: String,
        validate: {
            validator: function (v) {
                return this.password == v;
            },
            message: "password didn't match"
        }
    },
    dob: {
        type: Date,
        required: [true, 'dob required']
    },
    gender: {
        type: String,
        required: [true, 'gender required']
    },
    profilePicLink: {
        type: String,
    },
    verificationToken:String,
    forgotToken:String,

}, { collection: 'userRegister' })
userSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmPassword = undefined;
    next();
})

module.exports = {
    userSchema: userSchema
}
