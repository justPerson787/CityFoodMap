const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateRestaurant } = require('../middleware');

const Foodplace = require('../models/foodplace');

router.get('/', catchAsync(async (req, res) => {
    const restaurants = await Foodplace.find({ });
    res.render('restaurants/index', { restaurants })
}));

router.get('/add', isLoggedIn, (req, res) => {    
    res.render('restaurants/add');
});

router.post('/', isLoggedIn, validateRestaurant, catchAsync(async (req, res, next) => {     
    // if(!req.body.restaurant) throw new ExpressError('Invalid place data', 400);     
     const restaurant = new Foodplace(req.body.restaurant);
     restaurant.author = req.user._id;
     await restaurant.save();
     req.flash('success', 'New restaurant added!');
     res.redirect(`/restaurants/${restaurant._id}`)    
}));
 
router.get('/:id', catchAsync(async (req, res) => {
     const restaurant = await Foodplace.findById(req.params.id).populate('reviews').populate({
         path: 'reviews',
         populate: {
             path: 'author'
         }
        }).populate('author');      
     if(!restaurant){
        req.flash('error', 'Cannot find the place');
        return res.redirect('/restaurants');
    } 
     res.render('restaurants/show', { restaurant });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Foodplace.findById(id);      
    if(!restaurant){
        req.flash('error', 'Cannot find the place');
        return res.redirect('/restaurants');
    }          
    res.render('restaurants/edit', { restaurant });
}));

router.put('/:id', isLoggedIn, isAuthor, validateRestaurant, catchAsync(async (req, res) => {
    const { id } = req.params;    
    const rest = await Foodplace.findByIdAndUpdate(id, { ...req.body.restaurant });
    req.flash('success', 'Restaurant updated successfully!')
    res.redirect(`/restaurants/${rest._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Foodplace.findByIdAndDelete(id);
    req.flash('success', 'Restaurant deleted successfully');
    res.redirect('/restaurants');
}));

module.exports = router;