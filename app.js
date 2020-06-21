const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Foodplace = require('./models/foodplace');

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

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/restaurants', async (req, res) => {
    const restaurants = await Foodplace.find({ });
    res.render('restaurants/index', { restaurants })
})

app.get('/restaurants/add', (req, res) => {
    res.render('restaurants/add');
})

app.post('/restaurants', async (req, res) => {    
    const restaurant = new Foodplace(req.body.restaurant);
    await restaurant.save();
    console.log(restaurant);
    res.redirect(`/restaurants/${restaurant._id}`)
    //res.send('POST restaurants response!');
});

app.get('/restaurants/:id', async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);    
    res.render('restaurants/show', { restaurant });
})

app.get('/restaurants/:id/edit', async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id);    
    res.render('restaurants/edit', { restaurant });
})

app.put('/restaurants/:id', async (req, res) => {
    const { id } = req.params;
    const restaurant = await Foodplace.findByIdAndUpdate(id, { ...req.body.restaurant });
    res.redirect(`/restaurants/${restaurant._id}`);
})

app.delete('/restaurants/:id', async (req, res) => {
    const { id } = req.params;
    await Foodplace.findByIdAndDelete(id);
    res.redirect('/restaurants');
})

app.listen(3000, ()=> {
    console.log('serving on port 3000')
})