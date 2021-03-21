const express = require('express');
const router = express.Router({mergeParams: true}); //altfel nu aveam acces la parametrii din route: 
                                                    // nu puteam accesa campgroundId din "/campgrounds/:id/reviews"
                                                    // vezi app.js
const {reviewSchema} = require('../schemas'); //this is not the mongo schema, it's the Joi schema


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');
const Review = require('../models/review');

const validateReview = (req, res, next) => {
    const result = reviewSchema.validate( req.body );
    const {error} = result;
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}

router.post( '/', validateReview, catchAsync( async( req, res ) => {
    
    const campground = await Campground.findById( req.params.id);
    const review = new Review( req.body.review );
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Succesfully posted a new review.')
    res.redirect(`/campgrounds/${campground._id}`);
    
}))

router.delete( '/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Succesfully deleted a review.')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;