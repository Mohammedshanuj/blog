const express = require('express')
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const crypto = require('crypto')


const { User_Model } = require('../Model/UserModel');
const upload = require('../Schema/upload');
const sendEmail = require('../email');
const { blog_Model } = require('../Model/BlogModel');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


const uri = process.env.DB_URL.replace(
    "<PASSWORD>",
    process.env.DB_PASSWORD
);

mongoose.connect(uri);
console.log("user router base connected");

const user_Router = express.Router();



const uploadProfilePic = async (req, res, next) => {
    console.log('test1');
    console.log(req.file);
    const { body } = req


    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    })

    const uploadedProfile = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `blog/${req.file.originalname}`,
        Body: req.file.buffer
    }).promise()
    req.profile = uploadedProfile.Location
    req.body = body
    next()

}


const regUser = async (req, res, next) => {
    console.log('test 2');
    //const profile = req.profile
    // const user = req.body
    const { body } = req
    user = body


    await User_Model.create({
        // firstName:user.firstName,
        // lastName:user.lastName,
        userType: user.userType,
        name: user.name,
        password: user.password,
        email: user.email,
        confirmPassword: user.confirmPassword,
        dob: user.dob,
        gender: user.gender,
        // profilePicLink: profile
    }).then((success) => {
        res.send({
            message: 'data added succesfully',
            data: success
        })
        console.log(success);
        console.log("added succefully");
        req.email = user.email
        next()

    }).catch((err) => {
        res.status(404).send({
            message: "error occur checling",
            error: err
        })
        console.log(err);
    })

}
const sendRegVerification = async (req, res, next) => {
    const data = await User_Model.findOne({ email: req.email })
    if (!data) {
        res.status(403).send({
            message: 'no email existing'
        })
    } else {
        const verifyToken = crypto.randomBytes(16).toString("hex");

        const complexToken = crypto
            .createHash("sha256")
            .update(verifyToken)
            .digest("hex");
        data.verificationToken = complexToken;
        const updateUser = await User_Model.findByIdAndUpdate(
            data._id,
            {
                ...data,
            },
            {
                runValidators: false,
                new: true,
            }
        );

        console.log(updateUser);
        console.log('email found');

        try {

            console.log(verifyToken);
            await sendEmail({
                email: req.email,
                subject: "Please Verify registration",
                message: `${req.protocol}://${req.get(
                    "host"
                )}/api/v1/user/verify/${verifyToken}`,
                text: ' login for exploring thankyou for register😊'
            });
            // res.status(201).send({
            //     message:
            //         "Registration verification send to user email account success",
            // });
            console.log("Registration verification send to user email account success");
        } catch (e) {
            console.log(e)
            res.status(500).send({
                message: "Something went wrong, unable to send mail",
            });
            console.log('something wrong');
        }
    }
}
const verifyRegister = async (req, res, next) => {
    console.log(req.params.token);
    const token = req.params.token
    const complexToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    try {
        const data = await User_Model.findOneAndUpdate({ verificationToken: complexToken }, { userType: "NORMAL" }, {
            new: true,
        })
        console.log(data);
        console.log('checking');
       // data.verificationToken = undefined
        data.save(data)
        console.log('after save');
        console.log(data);
        // if (!data) {
        //     res.status(400).send({
        //         message: 'no email existing'
        //     })
        // }
        // User_Model.findByIdAndUpdate({})
        // data.userType = 'NORMAL'
        res.send({
            message: 'verified succesfully',
            data

        })
    }catch(e){
        res.status(404).send({
            message:e
        })
    }
    }

const searchEmail = async (req, res, next) => {
        const { email, password } = req.body
        //console.log(email, password);
        const data = await User_Model.findOne({ email }).select("+password")
        if (data) {
            console.log('valid email');
            req.password = password
            req.data = data
            next()
        }
        else {
            console.log('invalid email');
        }
    }

    const passwordChecker = async (req, res, next) => {
        const match = await bcrypt.compare(req?.password, req.data?.password);
        if (match) {
            console.log('password matched');
            req.data = req.data
            next()
        }
        else {
            res.status(400).send({
                message: "incorrect password"
            })
            console.log('incorrect password');
        }
    }

    const loginUser = async (req, res, next) => {
        const user = req.data
        var token = jwt.sign({ userId: user?._id, email: user.email }, process.env.JWT_SECRET);
        console.log(token);
        console.log("login succesfully");
        // const blog = await blog_Model.updateOne({
        //     pages: [{
        //         name: 'LogOut',
        //         to: '/logout'
        //     }]
        // })

        res.send({
            token,
            user,
            // blog,
            message: 'login succesfully'
        })
    }

    const forgotPassword = async (req, res, next) => {

        const { email } = req.body
        console.log(email);
        const user = await User_Model.findOne({
            email
        })
        if (!user) {
            res.status(400).send({
                message: 'invalid email'
            })
        }
        else {
            const verifyToken = crypto.randomBytes(16).toString("hex");
            res.send({
                verifyToken
            })
            const complexToken = crypto
                .createHash("sha256")
                .update(verifyToken)
                .digest("hex");
            user.forgotToken = complexToken;
            await User_Model.findByIdAndUpdate(
                user._id,
                {
                    ...user,
                },
                {
                    runValidators: false,
                    new: true,
                }
            );

            try {

                // res.send({
                //     verifyToken
                // })
                await sendEmail({
                    email: email,
                    subject: "Set new password",
                    message: `${req.protocol}://localhost:3000/setPassword/${verifyToken}`,
                    text: ' set new password and explore😊'
                });
                // res.status(201).send({
                //     message:
                //         "Registration verification send to user email account success",
                // });
                console.log("reset password link send succesfully");

            } catch (e) {
                console.log(e)
                res.status(500).send({
                    message: "Something went wrong, unable to send mail",
                });
                console.log('something wrong');
            }
        }
    }
    const setPassword = async (req, res, next) => {

        const { password, confirmPassword ,token} = req.body
        console.log(password,confirmPassword,token);
        const complexToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const data = await User_Model.findOne({ forgotToken: complexToken })
        data.password = password
        data.confirmPassword = confirmPassword

        data.forgotToken = undefined
        await data.save(data)
        res.send({
            message: 'passsword changed succesfully',
            data

        })

    }


    //user_Router.route('/reg').post(upload.single('image'), uploadProfilePic, regUser)
    user_Router.route('/reg').post(regUser, sendRegVerification)
    user_Router.route('/verify/:token').post(verifyRegister)
    user_Router.route('/login').post(searchEmail, passwordChecker, loginUser)
    user_Router.route('/forgotPassword').post(forgotPassword)
    user_Router.route('/setPassword').post(setPassword)

    module.exports = user_Router;