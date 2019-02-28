const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInfoSchema = new Schema({
    name : {
        firstName: {
            type: String,
        },
        middleName: {
            type: String,
        },
        lastName: {
            type: String,
        },
    },
    sex: {
        type: String,
    },
    mobileno: {
        type: String,
    },
    address: {
        type: String,
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    city: {
        type: String,
    },
    pincode: {
        type: String,
    }
});


const UserInfo = mongoose.model('userinfo',userInfoSchema);
module.exports = UserInfo;