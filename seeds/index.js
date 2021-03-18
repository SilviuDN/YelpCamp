const mongoose = require('mongoose');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection; //to shorten code
db.on("error", console.error.bind( console, "connection error: "));
db.once("open", () => {
    console.log("Database connected.");
});

const sample = array => array[ Math.floor( Math.random() * array.length )];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i<50; i++){
        const random1000 = Math.floor( Math.random() * 1000);
        const random18 = Math.floor( Math.random() * 18);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // title: `${descriptors[random18]} ${places[random18]}`,
            title: `${ sample(descriptors) } ${ sample( places )}`,
            price: Math.floor( Math.random() * 50)
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});