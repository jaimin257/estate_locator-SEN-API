const mongoose = require('mongoose');
const { Schema } = mongoose;

const discussionSchema = new Schema({
    propertyId: {
        type: String,
        required: true,
    },
    comments: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        commentText: {
            type: String,
            required: true,
        },
        createdOn: {
            type: String,
            required: true,
        }
    }]
});

const Discussion = mongoose.model('discussion',discussionSchema);
module.exports = Discussion;