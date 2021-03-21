const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {campgroundSchema} = require('../schemas'); 
const {isLoggedIn} = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {

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

router.get('/', catchAsync( async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.post('/', isLoggedIn, validateCampground, catchAsync( async (req, res, next) => {
    // if( !req.body.campground ) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Succesfully made a new campground.')
    res.redirect(`campgrounds/${campground._id}`);
    // res.render("campgrounds/show", {campground});

}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.get('/:id', catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');;
    if(!campground){
        req.flash('error', 'Cannot find this campground.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground} );
    // res.render('campgrounds/show', {campground, msg: req.flash('success')} ); // we set up a middleware
}));

router.get('/:id/edit', isLoggedIn, catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    // console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find this campground.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}));

router.put('/:id', isLoggedIn, validateCampground, catchAsync( async (req, res, next) => {
            // res.send(req.body);
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    //Asa nu merge:
    // res.redirect(`campgrounds/${campground._id}`);
    //A trebuit sa pun un slash nenecesar in ruta pentru New!!!
    req.flash('success', 'Succesfully edited campground.')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted campground.')
    res.redirect('/campgrounds');
}));



module.exports = router;