const express = require('express');
const { model } = require('mongoose');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync( async (req, res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.flash('success',`Welcome to YelpCamp ${registeredUser.username}!`);
        res.redirect('/campgrounds');
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
    // console.log(registeredUser);

}))


router.get('/login', (req, res) => {
    res.render('users/login');
})

// we can have a different route to auth google, fbk etc.
// options:
    // - failure flash - flashes message automatically
    // - failure redirect - redirects if falure
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', `Welcome back, ${req.body.username}!`);
    res.redirect('/campgrounds');
})



module.exports = router;