const {campgroundSchema} = require('./schemas'); 
const {reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login'); 
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {

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

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'Yo do not have permission to do this.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const result = reviewSchema.validate( req.body );
    const {error} = result;
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}