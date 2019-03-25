const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

    /* User applied field */
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    }, 

    /* Server added field */
    createdOn: {
        type: Date,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    addedExtraInfo: {
        type: Boolean,
        default: false,
        required: true
    },
    randomHash: {
        type: String,
        required: true,
    },
    properties: [{
        type: Schema.Types.ObjectId,
        ref: 'property'
    }],
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