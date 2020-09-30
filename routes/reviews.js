const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Foodplace = require('../models/foodplace');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);
    const review = new Review(req.body.review);  
    review.author = req.user._id;  
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save(); //to save review in restaurant's aray for reviews
    req.flash('success', 'New review added');
    res.redirect(`/restaurants/${restaurant._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //pull - recommended solution to remove item from array, mongo
    await Foodplace.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted');
    res.redirect(`/restaurants/${id}`);
}));

module.exports = router;