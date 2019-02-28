const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishListSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    properties: [{
        type: Schema.Types.ObjectId,
        ref: 'property',
    }],
    totalProperties: {
        type: String,
        required: true,
    }
});

const WishList = mongoose.model('wishList',wishListSchema);
module.exports = WishList;