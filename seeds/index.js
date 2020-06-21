const mongoose = require('mongoose');
const { places } = require('./seedHelper');
const Foodplace = require('../models/foodplace');

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

const seedDB = async() => {
    await Foodplace.deleteMany({});
    for (let i = 0; i< 12; i++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const place = new Foodplace({
            title: `${places[i]}`,
            image: 'https://source.unsplash.com/collection/1006898',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ut labore ratione quasi eaque architecto praesentium voluptatibus quaerat voluptatem similique veritatis? Non, deserunt a recusandae harum iste voluptatem culpa. Ipsa, sed!',
            price: price
        })
        await place.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});