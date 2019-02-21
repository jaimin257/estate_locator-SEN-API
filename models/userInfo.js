const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInfoSchema = new Schema({
    
    user_first_name: {
        type: String,
    },
    user_middle_name: {
        type: String,
    },
    user_last_name: {
        type: String,
    },
    user_sex: {
        type: String,
    },
    user_email_id: {
        type: String,
    },
    user_mobileno: {
        type: String,
    },
    user_telno: {
        type: String,
    },
    user_adr_line_1: {
        type: String,
    },
    user_adr_line_2: {
        type: String,
    },
    user_adr_line_3: {
        type: String,
    },
    user_country: {
        type: String,
        required: true,
    },
    user_state: {
        type: String,
        required: true,
    },
    user_district: {
        type: String,
        required: true,
    },
    user_city: {
        type: String,
    },
    adr_pincode: {
        type: String,
    }
});


const UserInfo = mongoose.model('userinfo',userInfoSchema);
module.exports = UserInfo;