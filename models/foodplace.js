const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodPlaceSchema = new Schema({
    ID: {type: mongoose.SchemaTypes.ObjectId, index: true},
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

module.exports = mongoose.model('foodplace', FoodPlaceSchema); //model and schema