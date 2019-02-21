const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertySchema = Schema({

    propertyName: {
        type: String,
        required: true,
    },
    propertyLocation: {
        type: String,
        required: true,
    },
    constructionStatus: {
        type: String,
        required: true,
    },
    bookingStatus: {
        type: String,
        required: true,
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'seller', 
    }
    ,

    /* Server added field */
    createdOn: {
        type: Date,
        required: true,
    },
    lastModified: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
});

const Property = mongoose.model('property',propertySchema);
module.exports = Property;