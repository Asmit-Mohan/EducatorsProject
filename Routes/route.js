const express = require('express');
const router = express.Router();
const Employee=require('../models/schema');
const {JoiSchema, forgotSchema} = require('../models/validation');
const bcrypt= require('bcrypt');

const saltRounds = 10;
const Publishable_Key = process.env.publishableKey;
const Secret_Key = process.env.secretKey;
const stripe = require('stripe')(Secret_Key) 

global.flag=1;
global.ID;

function OTP(min, max)
{
    global.myNumber = Math.floor(Math.random() * (max - min)) + min;
    return myNumber;
}

router.use((req,res,next)=>
{
    res.locals.Success = req.flash('success');
    res.locals.Error = req.flash('error');
    res.locals.Valid = req.flash('valid');
    next();
});


router.get("/",(req,res)=>
{
    res.render("index",{Studentusername:req.session.username});
});

router.get("/Template/index",(req,res)=>
{
    res.render("index",{Studentusername:req.session.username});
});

router.get("/Template/about",(req,res)=>
{
    res.render("about");
});

router.get("/Template/contact",(req,res)=>
{
    res.render("contact");
});

router.get("/Template/signin",(req,res)=>
{
    res.render("signin");
});

router.get("/Template/profile",(req,res)=>
{
    if(!req.session.username)
    {
        res.redirect("/");
    }
    else
    {
        res.render("profile",{Studentpic:req.session.picture,Studentusername:req.session.username,Studentid:ID,StudentemailProfile:req.session.emailProfile,Studentphone:req.session.phone,Studentcourses:req.session.courses});
    }
});

router.get("/Template/signup",(req,res)=>
{
    res.render("signup");
});

router.get("/Template/forgot",(req,res)=>
{
    res.render("forgot");
});

router.get("/Template/verifyOtp",(req,res)=>
{
    res.render("verifyOtp");
});

router.get("/Template/forgotEmail",(req,res)=>
{
    res.render("forgotEmail");
});

router.get("/Template/verifyForgotOtp",(req,res)=>
{
    res.render("verifyOtp");
});

router.get("/Template/signout",(req,res)=>
{
    flag=1;
    req.session.destroy();
    res.redirect("/");
});

router.get("/Template/dev",(req,res)=>{
       res.render("home",{key:Publishable_Key, price:149900, description:'Web Development and Android Development'});    
});

router.get("/Template/micro",(req,res)=>{
    res.render("home",{key:Publishable_Key, price:99900, description:'Microcontroller and Embedded System'});    
});

router.get("/Template/dsa",(req,res)=>{
    res.render("home",{key:Publishable_Key, price:249900, description:'Data Structure and Algorithms'});    
});

const validateProfile = (req, res, next) =>
{
    const { error } = JoiSchema.validate(req.body);
    if (error)
    {
        req.flash('valid',error.message);
        res.redirect('/Template/signup');
    }
    else
    {
        console.log('errorless');
        next();
    }
}

const forgotPassword = (req, res, next) =>
{
    const { error } = forgotSchema.validate(req.body);
    if (error)
    {
        req.flash('valid',error.message);
        res.redirect('/Template/forgot');
    }
    else
    {
        console.log('errorless');
        next();
    }
}

router.post("/employee/save",validateProfile,(req,res)=>
{
    const link1="https://drive.google.com/thumbnail?id=";
    const link2=req.body.imgId;
    const ans = link1.concat(link2);

        Employee.findOne({ email: req.body.email }, function (err, docs)
        {
            if(Boolean(docs))  /*Check for email existence*/
            {
                console.log("Email Already Exists");
                req.flash('error','Id Already Exists');
                res.redirect('/Template/signin');
            }   
            else
            {
                bcrypt.hash(req.body.password, saltRounds, function(err, hash)
                {
                    const newEmployee=new Employee({name:req.body.name,email:req.body.email,mobile:req.body.mobile,password:hash,image:ans});
                    const hello =  newEmployee.save();
                    console.log("Sign up successfull Redirecting to signin page");
                    req.flash('success','Successfully signed up!');
                    res.redirect('/Template/signin');   
                });
            }
        });
});

router.post("/employee/login", (req,res)=>
{
    const formData=new Employee(req.body);
    const formEmail=formData.email;
    const formPassword=formData.password;
    
    Employee.findOne({ email: formEmail }, function (err, docs) 
    {
             if(Boolean(docs))  /*Check for email existence*/
             {
                bcrypt.compare(formPassword, docs.password, function(err, result)
                {
                    if(result === true)
                    {
                        res.redirect('/Template/sendOtp?email='+docs.email);
                    }
                    else
                    {
                        console.log('Wrong password');
                        req.flash('error','Password entered by you is wrong');
                        res.redirect('/Template/signin');
                    }
                });
             }
             else
             {
                 console.log("User Does not exists"); 
                 req.flash('error','Id Does Not Exists');
                 res.redirect('/Template/signup');
             }
    });
});

router.post("/employee/forgot",  forgotPassword, (req,res)=>
{
    const formData=new Employee(req.body);
    const formEmail=formData.email;
    const formPassword=formData.password;

    Employee.findOne({ email: formEmail }, function (err, docs) 
    {
             if(Boolean(docs))  /*Check for email existence*/
             {
                        bcrypt.hash(req.body.password, saltRounds, function(err, hash)
                        {
                        console.log("h1");
                        Employee.findOneAndUpdate({ _id: docs._id }, {password:hash}, { new: true }, (err, result) => 
                        {
                            if (!err)
                            {
                                console.log('password changed successfully');
                                req.flash('success','Password changed successfully');
                                res.redirect('/Template/signin');
                            }
                            else 
                            {
                                console.log(`Password not changed successfully ${err}`);
                                req.flash('error',`Password not changed successfully ${err}`);
                                res.redirect('/Template/forgot');
                            }
                        });
                        });
             }
             else
             {
                 console.log("User Does not exists");
                 req.flash('error','Id Does Not Exists');
                 res.redirect('/Template/signup'); 
             }
    });
});

router.get("/Template/sendOtp",(req,res)=>
{
    const formEmail=req.query.email;
    Employee.findOne({ email: formEmail }, function (err, docs) 
    {
             if(Boolean(docs))  /*Check for email existence*/
             {
                    const nodemailer = require('nodemailer');
                    const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth:
                    {
                        user: process.env.Email,
                        pass: process.env.Password
                    }
                    });

                    const mailOptions =
                    {
                    from: process.env.Email,
                    to: formEmail,
                    subject: `OTP ${OTP(1000,9999)} Do Not Share With Anyone`,
                    html:'<img src="https://picsum.photos/id/0/1000/500"/>'
                    };

                    transporter.sendMail(mailOptions, function(error, info)
                    {
                    if (error)
                    {
                        console.log(error);
                    }
                    else
                    {
                        console.log('OTP Send Successfully: ' + info.response);
                        req.flash('success','OTP Send Successfully');
                        req.session.username=docs.name;
                        req.session.emailProfile=docs.email;
                        ID=docs._id;
                        req.session.phone=docs.mobile;
                        req.session.courses=docs.course;
                        req.session.picture=docs.image;
                        res.redirect('/Template/verifyOtp');
                    }
                    });
             }
             else
             {
                console.log("User Does not exists");
                req.flash('error','Id Does Not Exists');
                res.redirect('/Template/signup');
             }
    });
});

router.post("/Template/verifyOtp",(req,res)=>
{
    const otp=req.body.otp;
    if(otp==myNumber)
    {
        console.log('OTP validation successfull');
        flag=0;
        res.redirect('/Template/index');
    }
    else
    {
        console.log("Wrong OTP");
        req.flash('error','Wrong OTP Try Again!');
        res.redirect('/Template/signin');
    }
});

 /*For Forgot Password*/

router.post("/Template/forgotEmail",(req,res)=>
{
    const formEmail=req.body.email;
    Employee.findOne({ email: formEmail }, function (err, docs) 
    {
             if(Boolean(docs))  /*Check for email existence*/
             {
                    const nodemailer = require('nodemailer');
                    const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth:
                    {
                        user: process.env.Email,
                        pass: process.env.Password
                    }
                    });

                    const mailOptions =
                    {
                    from: process.env.Email,
                    to: formEmail,
                    subject: `OTP ${OTP(1000,9999)} Do Not Share With Anyone`,
                    html:'<img src="https://picsum.photos/id/0/1000/500"/>'
                    };

                    transporter.sendMail(mailOptions, function(error, info)
                    {
                    if (error)
                    {
                        console.log(error);
                    }
                    else
                    {
                        console.log('OTP Send Successfully: ' + info.response);
                        req.flash('success','OTP Send Successfully');
                        res.redirect('/Template/verifyForgotOtp');
                    }
                    });
             }
             else
             {
                 console.log("User Does not exists");
                 req.flash('error','Id Does Not Exists');
                 res.redirect('/Template/signup');
             }
    });
});

 /*For Forgot Password*/

router.post("/Template/verifyForgotOtp",(req,res)=>
{
    const otp=req.body.otp;
    if(otp==myNumber)
    {
        console.log('OTP validation successfull');
        res.redirect('/Template/forgot');
    }
    else
    {
        console.log("Wrong OTP");
        req.flash('error','Wrong OTP Try Again!');
        res.redirect('/Template/signin');
    }
});

router.post("/Template/contact",(req,res)=>
{
    const Email=req.body.email;
    const mobile=req.body.mobile;
    const message=req.body.message;
    const name=req.body.name;

    Employee.findOne({ email: Email }, function (err, docs) 
    {
             if(Boolean(docs))  /*Check for email existence*/
             {
                    const nodemailer = require('nodemailer');
                    const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth:
                    {
                        user: process.env.Email,
                        pass: process.env.Password
                    }
                    });

                    const mailOptions =
                    {
                    from: Email,
                    to: process.env.Email,
                    subject: `Enquiry by Mr/Mrs ${name}`,
                    text: `${message} You can Contact me on +91 ${mobile} or Mail me on ${Email}`
                    };

                    transporter.sendMail(mailOptions, function(error, info)
                    {
                    if (error)
                    {
                        console.log(error);
                    }
                    else
                    {
                        console.log('Email sent Successfully');
                        req.flash('Success','Email sent Successfully');
                        res.redirect('/Template/contact');
                    }
                    });
             }
             else
             {
                 console.log("To Enquiry You Must Be Registered");
                 req.flash('error','Id Does Not Exists');
                 res.redirect('/Template/signup');
             }
    });
});

router.post("/payment/Web%20Development%20and%20Android%20Development",(req,res)=>
{
        Employee.findOne({ email: req.body.stripeEmail }, function (err, docs) 
        {
          if(Boolean(docs))  /*Check for email existence*/
            {
                stripe.customers.create(
                    { 
                        email: req.body.stripeEmail,
                        source: req.body.stripeToken
                    }) 
                .then((customer) =>
                {
                    return stripe.charges.create(
                    { 
                        amount: 149900,
                        description: 'Website and App Development', 
                        currency: 'INR', 
                        customer: customer.id 
                    }); 
                }) 
                .then((charge) =>
                { 
                    console.log("Congratulations!, you are enrolled in Website and App Development course");
                    Employee.findOneAndUpdate({email: docs.email }, {course:'Website and App Development'}, { new: true }, (err, doc) => 
                        {
                            req.session.courses = 'Website and App Development';
                            res.redirect("/Template/index");
                        });
                    
                }) 
                .catch((err) =>
                { 
                    res.send(err)	
                }); 
            }
            else
            {
                console.log("Sorry You have to sign up first to buy a course on Educators");
                req.flash('error','Sorry You have to sign up first to buy a course on Educators');
                res.redirect("/Template/signup");
            }
        });
});

router.post("/payment/Microcontroller%20and%20Embedded%20System",(req,res)=>
{
    Employee.findOne({ email: req.body.stripeEmail }, function (err, docs) 
    {
      if(Boolean(docs))  /*Check for email existence*/
        {
                stripe.customers.create(
                { 
                    email: req.body.stripeEmail,
                    source: req.body.stripeToken
                }) 
            .then((customer) =>
            {
                return stripe.charges.create(
                { 
                    amount: 99900,
                    description: 'Microcontroller and Embedded Systems', 
                    currency: 'INR', 
                    customer: customer.id 
                }); 
            }) 
            .then((charge) =>
            { 
                console.log("Congratulations!, you are enrolled in Microcontroller and Embedded System")
                Employee.findOneAndUpdate({email: docs.email }, {course:'Microcontroller and Embedded Systems'}, { new: true }, (err, doc) => 
                {
                    req.session.courses = 'Microcontroller and Embedded Systems';
                    res.redirect("/Template/index");
                });
            }) 
            .catch((err) =>
            { 
                res.send(err)	
            }); 
       }
       else
       {
            console.log("Sorry You have to sign up first to buy a course on Educators");
            req.flash('error','Sorry You have to sign up first to buy a course on Educators');
            res.redirect("/Template/signup");
       }
   });
});

router.post("/payment/Data%20Structure%20and%20Algorithms",(req,res)=>
{
    Employee.findOne({ email: req.body.stripeEmail }, function (err, docs) 
    {
      if(Boolean(docs))  /*Check for email existence*/
        {
                stripe.customers.create(
                { 
                    email: req.body.stripeEmail,
                    source: req.body.stripeToken
                }) 
            .then((customer) =>
            {
                return stripe.charges.create(
                { 
                    amount: 249900,
                    description: 'Data Structure and Algorithms', 
                    currency: 'INR', 
                    customer: customer.id 
                }); 
            }) 
            .then((charge) =>
            { 
                console.log("Congratulations!, you are enrolled in Data Structure and algorithms course");
                Employee.findOneAndUpdate({email: docs.email }, {course:'Data Structure and Algorithms'}, { new: true }, (err, doc) => 
                {
                    req.session.courses = 'Data Structure and Algorithms';
                    res.redirect("/Template/index");
                });
            }) 
            .catch((err) =>
            { 
                res.send(err)	
            }); 
        }
        else
        {
            console.log("Sorry You have to sign up first to buy a course on Educators");
            req.flash('error','Sorry You have to sign up first to buy a course on Educators');
            res.redirect("/Template/signup");
        }
    });
});

router.get("*", (req, res)=>
{
    res.render("404error");
});

module.exports = router;

