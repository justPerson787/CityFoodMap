const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const FoodPlaceSchema = new Schema({
    ID: {type: mongoose.SchemaTypes.ObjectId, index: true},
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

//delete stored reviews if the place is deleted
FoodPlaceSchema.post('findOneAndDelete', async function(doc){
    if (doc){
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('foodplace', FoodPlaceSchema); //model and schema