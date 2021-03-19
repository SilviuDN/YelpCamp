const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //one of many engines used to run/parse/make sense of ejs
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
// const { Console } = require('console');

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

const app = express();

app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// const validateCampground = (req, res, next) => {
    
//     const campgroundSchema = Joi.object({
//         campground: Joi.object({
//             title: Joi.string().required(),
//             price: Joi.number().required().min(0),
//             image: Joi.string().require(),
//             location: Joi.string().require(),
//             description: Joi.string().require()
//         }).required()
//     })
//     const result = campgroundSchema.validate( req.body );
//     const {error} = result;
//     // console.log(result.error);
//     if(error){
//         const msg = error.details.map(el => el.message).join(', ');
//         throw new ExpressError(msg, 400);        
//     }else{
//         next();
//     }
// }


app.get('/', (req, res) => {
    // res.send('Hello from YelpCamp!');
    res.render('home');
});

app.get('/campgrounds', catchAsync( async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

app.post('/campgrounds',   catchAsync( async (req, res, next) => {
    // if( !req.body.campground ) throw new ExpressError('Invalid Campground Data', 400);
    
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            // image: Joi.string().require(),
            // location: Joi.string().require(),
            // description: Joi.string().require()
        }).required()
    })
    const result = campgroundSchema.validate( req.body );
    const {error} = result;
    // console.log(result.error);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);        
    }


    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`);
    // res.render("campgrounds/show", {campground});

}));

app.get('/campgrounds/new',  (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground} );
}));

app.get('/campgrounds/:id/edit', catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}));

app.put('/campgrounds/:id', catchAsync( async (req, res, next) => {
            // res.send(req.body);
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    //Asa nu merge:
    // res.redirect(`campgrounds/${campground._id}`);
    //A trebuit sa pun un slash nenecesar in ruta pentru New!!!
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('PageNot Found', 404));
    // res.send("404!!!")
})

app.use( (err, req, res, next ) => {
    const { statusCode = 500} = err;
    if(!err.message){
        err.message = 'Oh no, smth went wrong!'
    }
    res.status(statusCode).render('error', {err});
});

// app.use( (err, req, res, next ) => {
//     const { statusCode = 500, message = 'Smth went wrong!' } = err;
//     res.status(statusCode).render('error');
//     // res.status(statusCode).send(message);
//     // res.send('Smth went wrong!' + statusCode + message);
// });


app.listen(3000, () => {
    console.log('Serving on port 3000');
});