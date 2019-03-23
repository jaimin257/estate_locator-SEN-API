const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertyInfoSchema = new Schema({
    property_name: {
        type: String,
        required: true,
    },
    
});

const PropertyInfo = mongoose.model('propertyInfo',propertyInfoSchema);
module.exports = PropertyInfo;