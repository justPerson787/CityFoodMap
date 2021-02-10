if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

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
//security
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//Add ROUTES
const restaurantsRoutes = require('./routes/restaurants');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const MongoDBStore = require('connect-mongo')(session);

require('dotenv').config(); //to read .env file for mongodb connection


//Local Mongo DB
//'mongodb://localhost27017/cityfood' for local db called cityfood
//const dbUrl = 'mongodb://localhost27017/cityfood';

//MongoDB Atlas
const uri = process.env.ATLAS_URI; //connect mongodb with atlas 
//const uri = process.env.ATLAS_URI || 'mongodb://localhost27017/cityfood';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
///*'mongodb://localhost27017/cityfood-map' for local db called cityfood-map

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
app.use(mongoSanitize());

const secret = process.end.SECRET || 'thisshouldbeasecret!';
//Configure Mongo for Session Store
const store = new MongoDBStore({
    url: uri, //dbUrl for local DB or atlas
    secret,
    touchAfter: 24 * 60 * 60 //time in sec
});

store.on("error", function(e){
    console.log("Session store error!", e)
})

// Configure Session
const sessionConfig = {
    store: store,
    name: 'useruser', //default name
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //makes cookie not accessable through JS (sec)
        //secure: true, //work only in secured connection - for deploment activate
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7 //1 week in millisec
    }
    //store: 
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

// Content Security Policy with helmet
//Restrict list of resources we can fetch from
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnyqwohwz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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