const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const {campgroundSchema} = require('../schemas'); 
const {isLoggedIn, validateCampground, isAuthor, validateReview} = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

router.route('/')
    .get(catchAsync( campgrounds.index ))
    .post(isLoggedIn, validateCampground, catchAsync( campgrounds.createCampground ));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get( catchAsync( campgrounds.showCampground))
    .put( isLoggedIn, isAuthor, validateCampground, catchAsync( campgrounds.updateCampground))
    .delete( isAuthor, isLoggedIn, catchAsync( campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( campgrounds.renderEditForm ));



module.exports = router;