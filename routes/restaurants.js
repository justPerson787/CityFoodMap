const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { restaurantSchema } = require('../validationSchemas.js');
const ExpressError = require('../utils/ExpressError');
const Foodplace = require('../models/foodplace');

const validateRestaurant = (req, res, next) => {
    const { error } = restaurantSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const restaurants = await Foodplace.find({ });
    res.render('restaurants/index', { restaurants })
}));

router.get('/add', (req, res) => {
    res.render('restaurants/add');
});

router.post('/', validateRestaurant, catchAsync(async (req, res, next) => {     
    // if(!req.body.restaurant) throw new ExpressError('Invalid place data', 400);     
     const restaurant = new Foodplace(req.body.restaurant);
     await restaurant.save();
     req.flash('success', 'New restaurant added!');
     res.redirect(`/restaurants/${restaurant._id}`)    
}));
 
router.get('/:id', catchAsync(async (req, res) => {
     const restaurant = await Foodplace.findById(req.params.id).populate('reviews');  
     res.render('restaurants/show', { restaurant });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);    
    res.render('restaurants/edit', { restaurant });
}));

router.put('/:id', validateRestaurant, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Foodplace.findByIdAndUpdate(id, { ...req.body.restaurant });
    res.redirect(`/restaurants/${restaurant._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Foodplace.findByIdAndDelete(id);
    res.redirect('/restaurants');
}));

module.exports = router;