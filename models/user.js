const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

    /* User applied field */
    /*
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
    */
    firstName : {
        type: String,
        required: true
    },
    lastName : {
        type: String,
        required: true,
    },
    primaryEmail: {
        type: String,
        required: true,
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
        type: Date,
        required: true,
    },
  /*
    wishList: {
        type: Schema.Types.ObjectId,
        ref: 'wishList',
        required: true,
    },
    userInfo: {
        type: Schema.Types.ObjectId,
        ref: 'userInfo',
    }
    */
});


const User = mongoose.model('user',userSchema);
module.exports = User;