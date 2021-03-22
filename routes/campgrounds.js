const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {campgroundSchema} = require('../schemas'); 
const {isLoggedIn, validateCampground, isAuthor, validateReview} = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');



router.get('/', catchAsync( async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.post('/', isLoggedIn, validateCampground, catchAsync( async (req, res, next) => {
    // if( !req.body.campground ) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
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
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    // console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find this campground.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground} );
    // res.render('campgrounds/show', {campground, msg: req.flash('success')} ); // we set up a middleware
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    // console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find this campground.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync( async (req, res, next) => {
            // res.send(req.body);
    const {id} = req.params;
    // const campground = await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'Yo do not have permission to do this.');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const campground2 = await Campground.findByIdAndUpdate(id, req.body.campground);
    // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    //Asa nu merge:
    // res.redirect(`campgrounds/${campground._id}`);
    //A trebuit sa pun un slash nenecesar in ruta pentru New!!!
    req.flash('success', 'Succesfully edited campground.')
    res.redirect(`/campgrounds/${campground2._id}`);
}));

router.delete('/:id', isAuthor, isLoggedIn, catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted campground.')
    res.redirect('/campgrounds');
}));



module.exports = router;