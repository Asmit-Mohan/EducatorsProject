const Joi  = require('@hapi/joi');
const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const message= "Password should be in between 8 to 15 characters which contain at least one lowercase letter,one uppercase letter, one numeric digit, and one special character";

module.exports.JoiSchema = Joi.object(
{
    name: Joi.string().min(5).max(20).required(),
    email: Joi.string().email().min(5).max(30).required(),
    mobile: Joi.string().min(10).max(13).required(),
    password: Joi.string().regex(strongPasswordRegex).error(new Error(message)).required(),
    course: Joi.string().optional(),
    image: Joi.string().required()
});

module.exports.forgotSchema =  Joi.object(
    {
        email: Joi.string().email().min(5).max(30).required(),
        password: Joi.string().regex(strongPasswordRegex).error(new Error(message)).required()
    });



/*
To check a password between 8 to 15 characters which contain at least one lowercase letter,
one uppercase letter, one numeric digit, and one special character

*/