const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodPlaceSchema = new Schema({
    ID: {type: mongoose.SchemaTypes.ObjectId, index: true},
    title: String,
    image: String,
    price: String,
    description: String,
    location: String
});

module.exports = mongoose.model('foodplace', FoodPlaceSchema); //model and schema