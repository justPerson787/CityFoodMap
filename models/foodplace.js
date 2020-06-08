const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodPlaceSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

module.exports = mongoose.model('foodplace', FoodPlaceSchema); //model and schema