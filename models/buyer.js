const mongoose = require('mongoose');
const { Schema } = mongoose;

const buyerSchema = new Schema({

});


const Buyer = mongoose.model('buyer',buyerSchema);
module.exports = Buyer;