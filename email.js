const nodemailer=require('nodemailer');

const sendEmail=async (options)=>{
    //1. create transporter
    //TRANSPORTER IS SERVICE PROVIDER
   // console.log(options);
    const mailTransporter=nodemailer.createTransport({
        service: 'gmail',
        auth: {
          
        }
    })



    //2.creating option for email

     const mailConfigurations = {
        from: 'mohammed.shanuj@emvigotech.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    };
console.log('test mail 1');
    //3.semding email

     mailTransporter.sendMail(mailConfigurations, function(err, data) {
        console.log('test mail 2');
        if(err) {
            console.log(err);
        } else {
            console.log('Email sent successfully');
            console.log(data);
        }
    });
}
module.exports=sendEmail;
