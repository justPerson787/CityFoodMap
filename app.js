const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//Add ROUTES
const restaurantsRoutes = require('./routes/restaurants');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

require('dotenv').config(); //to read .env file for mongodb connection

const uri = process.env.ATLAS_URI; //connect mongodb with atlas 

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7 //1 week in millisec
    }
    //store: 
}
app.use(session(sessionConfig));
app.use(flash());


//Authentification with passport library
app.use(passport.initialize());
app.use(passport.session()); //must be used after app.use(session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {//success, err - middleware to have access to flash msg locally
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/restaurants', restaurantsRoutes);
app.use('/restaurants/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home')
})

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