const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    createdOn: {
        type: Date,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
});


const Notification = mongoose.model('notification',notificationSchema);
module.exports = Notification;