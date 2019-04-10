const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    sex: {
        type: String,
        required: true,
    },
    mobileno: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
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
        required: true,
    },
    pincode: {
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

    //ResetPassword fields
    resetPasswordRequestTime: {
        type: Date,
    },

    resetPasswordToken: {
        type: String,
    },

    resetPasswordExpires: {
        type: Date,
    },

    resetPasswordRequest: {
        type: Number,
        default: 0
    },
  
    wishList: {
        type: Schema.Types.ObjectId,
        ref: 'wishList',
        required: true,
    }
});

userSchema.methods.isValid = async function (newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

const User = mongoose.model('user',userSchema);
module.exports = User;