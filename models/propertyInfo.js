const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertyInfoSchema = new Schema({
    property_name: {
        type: String,
        required: true,
    },
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
        type: String,
        required: true,
    }
});

const PropertyInfo = mongoose.model('propertyInfo',propertyInfoSchema);
module.exports = PropertyInfo;