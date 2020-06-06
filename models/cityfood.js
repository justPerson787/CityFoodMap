const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CityFoodSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

module.exports = mongoose.model('cityfood', CityFoodSchema); //model and schema