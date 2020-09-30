const Foodplace = require('../models/foodplace');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);
    const review = new Review(req.body.review);  
    review.author = req.user._id;  
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save(); //to save review in restaurant's aray for reviews
    req.flash('success', 'New review added');
    res.redirect(`/restaurants/${restaurant._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    //pull - recommended solution to remove item from array, mongo
    await Foodplace.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted');
    res.redirect(`/restaurants/${id}`);
}