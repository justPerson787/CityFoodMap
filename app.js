const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { restaurantSchema, reviewSchema } = require('./validationSchemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Foodplace = require('./models/foodplace');
const Review = require('./models/review');

require('dotenv').config(); //to read .env file for mongodb connection

const uri = process.env.ATLAS_URI; //connect mongodb with atlas 

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
///*'mongodb://localhost27017/cityfood-map' could be instead of uri for local db called cityfood-map

const db = mongoose.connection;
//check for successful connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("CityFood Database connected");
});

const app = express();

app.engine ('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })) //to extract POST request body
app.use(methodOverride('_method')); //method override for editing in form

const validateRestaurant = (req, res, next) => {
    const { error } = restaurantSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/restaurants', catchAsync(async (req, res) => {
    const restaurants = await Foodplace.find({ });
    res.render('restaurants/index', { restaurants })
}));

app.get('/restaurants/add', (req, res) => {
    res.render('restaurants/add');
});

app.post('/restaurants', validateRestaurant, catchAsync(async (req, res, next) => { 
   // if(!req.body.restaurant) throw new ExpressError('Invalid place data', 400);
    
    const restaurant = new Foodplace(req.body.restaurant);
    await restaurant.save();
    res.redirect(`/restaurants/${restaurant._id}`)    
}));

app.get('/restaurants/:id', catchAsync(async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);    
    res.render('restaurants/show', { restaurant });
}));

app.get('/restaurants/:id/edit', catchAsync(async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);    
    res.render('restaurants/edit', { restaurant });
}));

app.put('/restaurants/:id', validateRestaurant, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Foodplace.findByIdAndUpdate(id, { ...req.body.restaurant });
    res.redirect(`/restaurants/${restaurant._id}`);
}));

app.delete('/restaurants/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Foodplace.findByIdAndDelete(id);
    res.redirect('/restaurants');
}));

app.post('/restaurants/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);
    const review = new Review(req.body.review);
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save();
    res.redirect(`/restaurants/${restaurant._id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) {err.message = 'O No, Something Went Wrong'}
    res.status(statusCode).render('error', { err });
});

app.listen(3000, ()=> {
    console.log('serving on port 3000')
});