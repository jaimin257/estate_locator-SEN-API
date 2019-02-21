const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerSchema = new Schema({
    
});


const Seller = mongoose.model('seller',sellerSchema);
module.exports = Seller;