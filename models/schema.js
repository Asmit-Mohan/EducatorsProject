const mongoose = require('mongoose');
const details = new mongoose.Schema({
    name:
    {
        type: String,
        required: 'This field is required.',
        maxLength: 15
    },
    email:
    {
        type: String,
        required: 'This field is required.',
        maxLength: 30
    },
    mobile:
    {
        type: String,
        required: 'This field is required.',
        maxLength: 13
    },
    password:
    {
        type: String,
        required: 'This field is required.',
        minLength: 8
    },
    course:
    {
        type: String,
        default: 'You Have Not Purchased any Course Yet!'
    },
    image:
    {
        type: String,
        required: 'This field is required'
    }
});


const Employee = mongoose.model('Employee', details);   /*One of the variable here Employee of details datatype*/
module.exports = Employee;