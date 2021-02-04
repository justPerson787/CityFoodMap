const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
        url: String,
        filename: String    
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const FoodPlaceSchema = new Schema({
    ID: {type: mongoose.SchemaTypes.ObjectId, index: true},
    title: String,
    images: [ImageSchema],    
    location: String,
    geometry: {
        type: {
            "type":String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
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