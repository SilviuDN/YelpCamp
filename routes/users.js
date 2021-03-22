const express = require('express');
const { model } = require('mongoose');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');


router.route('/register')
    .get( users.renderRegister)
    .post( catchAsync( users.register));

router.route('/login')
    .get( users.renderLogin)
    .post( passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)
// we can have a different route to auth google, fbk etc.
// options:
    // - failure flash - flashes message automatically
    // - failure redirect - redirects if falure

router.get('/logout', users.logout)



module.exports = router;