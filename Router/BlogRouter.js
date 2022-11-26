
const express = require('express')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
//const { startSession } = require('../Model/BlogModel');
const { blog_Model } = require('../Model/BlogModel')
const { content_Model } = require('../Model/BlogModel')
const upload = require('../Schema/upload');
const AWS = require('aws-sdk');
const { User_Model } = require('../Model/UserModel');
const uri = process.env.DB_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose.connect(uri);
console.log("blog router base connected");

const blog_Router = express.Router()


const postNav = async (req, res, next) => {
  const { body } = req;
  await blog_Model.create({
    projectName: body.projectName,
    pages: body.pages,
  }).then((success) => {
    res.send({
      message: 'data added succesfully',
      data: success
    })
  }).catch((err) => {
    res.status(404).send({
      message: "some error occured",
      error: err
    })
  })
}

const updateNav = async (req, res, next) => {
  const { body } = req;
  await blog_Model.updateOne({
    projectName: body.projectName,
    pages: body.pages,

  }).then((success) => {
    res.send({
      message: 'data update succesfully',
      data: success
    })
  }).catch((err) => {
    res.status(404).send({
      message: "some error occured",
      error: err
    })
  })
}
const getNav = async (req, res, next) => {
  const data = await blog_Model.find()

  // const data={
  //   projectName:'SPEED',
  //   Pages:[
  //     {
  //       name:"Home",
  //       to:'/home'
  //     },{
  //       name:'Login',
  //       to:'/login'
  //     }
  //   ]
  // }
  try {
    res.send({
      data
    })
  } catch (err) {
    res.status(404).send({
      err
    })
  }
}


const postContent = async (req, res, next) => {
  const { body } = req
  console.log(req.file);
  const { email } = jwt.verify(body.token, process.env.JWT_SECRET)
  const user =await User_Model.findOne({ email: email })

    const postCount=await content_Model.countDocuments({ email: email })
   
  console.log(postCount);
  if (user.userType == 'NORMAL' && postCount >2) {

    res.send({
      message: 'blog post exceeded for more use premium'
    })
  } else {
    console.log('not exceeded');

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    })

    const uploadedImage = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `blog/${req.file?.originalname}`,
      Body: req.file?.buffer,
    }).promise()
    console.log(uploadedImage.Location);
    console.log(body.token);



    // const d=new Date()
    // console.log(d);
    // console.log(d.getTime());
    // console.log(d.currentTime);
    // console.log(body.startDate);
    //  const date=new Date('1900-11-02T00:01:01')
    //  const startT=date.getTime()

    //  console.log(startT);

    console.log("posting.....");
    content_Model.create({
      pageType: body.PageType,
      //startTS: new Date(body.startDate).getTime(),
      //endTS: new Date(body.endDate).getTime(),
      startTS: Date.now(),
      endTS: Date.now() + 86400000,
      status: body.status,
      title: body.title,
      variant: body.variant,
      bold: body.bold,
      italic: body.italic,
      description: body.description,
      email: email,
      blogImageURL: uploadedImage.Location

    }).then((success) => {
      res.send({
        message: 'data added succesfully',
        data: success
      })

    }).catch((err) => {
      console.log(err);
      res.status(404).send({
        message: "some error occured",
        error: err
      })
    })
  }
}
const updateContent = async (req, res, next) => {
  console.log('p1');
  console.log(req.params.id);

  const { body } = req
  console.log(body);
  console.log('p2');
  await content_Model.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  }).then((success) => {
    console.log(success)
    res.send({

      message: 'updated succesfully',
      data: success

    }
    )
  }).catch((err) => {
    res.status(400).send(err)
  })
};


const uploadBlogImage = async (req, res, next) => {
  const data = req.contData
  console.log('testing');
  console.log(data);

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  })

  const uploadedImage = await s3.upload({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `blog/${req.file.originalname}`,
    Body: req.file.buffer,
  }).promise()
  req.contentData.blogImageURL = uploadedImage.location



}
const getContent = async (req, res, next) => {
  const { id } = req.params
  console.log(id);
  try {
    const content = await content_Model.findById(id)
    res.send({
      content
    })
  } catch (e) {
    res.status(404).send({
      message: 'invalid id'
    })
  }

}

const isActive = async (req, res, next) => {
  const dateNow = Date.now()
  console.log(dateNow);
  const contentData = await content_Model.aggregate([
    {
      $match: {
        startTS: { $lte: dateNow },
        endTS: { $gte: dateNow }
      },
    },
    // {
    //   $group:{
    //     _id:{status:"1"}
    //   }
    // }
    // {
    //   $sort:{
    //     content

    //   }
    // }
  ])
  try {
    res.send({
      contentData,
      len: contentData.length
    })
    next()
  } catch (err) {
    res.status(400).send({
      err
    })
  }

}
const myBlogs = async (req, res, next) => {
  const dateNow = Date.now()
  console.log(dateNow);
  const { body } = req
  console.log(body.token);
  const { email } = jwt.verify(body.token, process.env.JWT_SECRET)
  console.log(email);
  const contentData = await content_Model.aggregate([
    {
      $match: {
        startTS: { $lte: dateNow },
        endTS: { $gte: dateNow },
        email: email
      },
    },
    // {
    //   $group:{
    //     _id:{email:"$email"}
    //   }
    //  }
    // {
    //   $sort:{
    //     content

    //   }
    // }
  ])
  try {
    res.send({
      contentData,
      len: contentData.length
    })
    console.log(contentData);

  } catch (err) {
    res.status(400).send({
      err
    })
  }

}

const likeManaging = async (req, res, next) => {

  const { id, like } = req.body
  console.log(id, like);
  const content = await content_Model.findById(id)
  console.log(content);
  let c = content.count

  if (like == true) {
    c = c + 1
    let value = await content_Model.findByIdAndUpdate(id, { like: true, count: c }, {
      new: true,
      runValidators: true
    })
    res.send({
      c: value.count,
      l: value.like
    })
  } else {
    c -= 1
    let value = await content_Model.findByIdAndUpdate(id, { count: c, like: false }, {
      new: true,
      runValidators: true
    })
    res.send({
      c: value.count,
      l: value.like
    })

  }


}

const limit = async (req, res, next) => {

}

blog_Router.route('/navbar').get(getNav).post(postNav).put(updateNav)
blog_Router.route('/content').post(upload.single('image'), postContent).get(getContent).put(updateContent)
blog_Router.route('/content/:id').put(upload.single('image'), updateContent)
blog_Router.route('/content/:id').get(getContent)
blog_Router.route('/isActive').get(isActive)
blog_Router.route('/myBlogs').post(myBlogs)
blog_Router.route('/like').post(likeManaging)




module.exports = blog_Router