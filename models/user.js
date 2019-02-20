const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

    /* User applied field */
    Name : {
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
    primaryEmail: {
        type: String,
        required: true,
        unique: true, 
    },
    secondaryEmail: {
        type: String,
        unique: true,
    },
    contactNo: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    

    /* Server added field */
    createdOn: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
    wishList: {
        type: Schema.Types.ObjectId,
        ref: 'wishList',
        require: true,
    },
    userInfo: {
        type: Schema.Types.ObjectId,
        ref: 'userInfo',
    }
});


const User = mongoose.model('user',userSchema);
module.exports = User;