const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertySchema = Schema({

// User Provided Fields...
    // Basic detail
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
        ref: 'user', 
    },

    // Property Info
    property_type: {
        type: String,
        required: true,
    },
    property_amount: {
        type: String,
        required: true,
    },
    contract_type: {
        type: String,
        required: true,
    },
    floor: {
        type: String,
        required: true,
    },
    carpet_area: {
        type: String,
        required: true,
    },
    adderess: {
        street: {
            type: String,
        },
        locality: {
            type: String,
        },
        city: {
            type: String,
        },
        required: true,
    },
    description: {
        type: String,
        required: true,
    },

    /* Server added field */
    createdOn: {
        type: Date,
        required: true,
    },
    lastModified: {
        type: Date,
        required: true,
    }
});

const Property = mongoose.model('property',propertySchema);
module.exports = Property;
