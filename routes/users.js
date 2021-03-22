const express = require('express');
const { model } = require('mongoose');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

router.get('/register', users.renderRegister);

router.post('/register', catchAsync( users.register));


router.get('/login', users.renderLogin)

// we can have a different route to auth google, fbk etc.
// options:
    // - failure flash - flashes message automatically
    // - failure redirect - redirects if falure
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)


router.get('/logout', users.logout)



module.exports = router;