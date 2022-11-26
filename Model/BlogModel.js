const mongoose = require('mongoose')
const {blogSchema} = require('../Schema/BlogSchema')
const {contentSchema} = require('../Schema/BlogSchema')
const blog_Model = mongoose.model('content', blogSchema)
const content_Model = mongoose.model('Usercontent', contentSchema)
module.exports = {
    blog_Model,
    content_Model}



