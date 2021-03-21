const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //one of many engines used to run/parse/make sense of ejs
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas'); 
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const Campground = require('./models/campground');
const Review = require('./models/review');
// const { Console } = require('console');


const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds'); // campgroundsRoutes
const reviewRoutes = require('./routes/reviews'); // reviewsRoutes


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false // sa dispara un mesaj de depricatedWarning
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

const sessionConfig = {
    secret: 'thisShouldBeABetterSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); // for persistant login sessions
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( (req, res, next ) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: "a@gmail.com", username: 'A.A.'});
    const newUser = await User.register(user, 'a');
    res.send(newUser);
})

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static('public'))

const validateCampground = (req, res, next) => {
    
    // const campgroundSchema = Joi.object({
    //     campground: Joi.object({
    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0),
    //         image: Joi.string().required(),
    //         location: Joi.string().required(),
    //         description: Joi.string().required()
    //     }).required()
    // })
    const result = campgroundSchema.validate( req.body );
    const {error} = result;
    // console.log(result.error);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);        
    }else{
        next();
    }
}



app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes) // ATENTIE: const router = express.Router({mergeParams: true}); in reviews.js



app.get('/', (req, res) => {
    // res.send('Hello from YelpCamp!');
    res.render('home');
});



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