const mongoose = require('mongoose')
const { Schema } = mongoose
const blogSchema = new Schema({
    projectName: String,
    pages: [{
        name: String,
        to: String
    }]
})
const contSchema = new Schema({
    title: String,
    variant: String,
    bold: Boolean,
    italic: Boolean,
    description: String,
    blogImageURL: String,

})
const likeSchema = new Schema({
    count:Number,
    like:Boolean
})


const contentSchema = new Schema({
    count:{
        type:Number,
        default:0

    },
    like:{
        type:Boolean,
        default:false
    },
    title: String,
    variant: String,
    bold: Boolean,
    italic: Boolean,
    description: String,
    blogImageURL: {
        type: String,
        default: null
    },
    pageType: {
        type: String,
        default: 'blog'
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    startTS: {
        type: Number
    },
    endDate: {
        type: Date,
        default: Date.now() + 86400000
    },
    endTS: {
        type: Number
    },
    content: contSchema,
    email:String,
    status: {
        type: Number,
        required: [true, '0 for inactive 1 for active'],
        default: '1'
    }






})


module.exports = {
    blogSchema: blogSchema,
    contentSchema: contentSchema,
    likeSchema:likeSchema
}