const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err =>{
            if(err) {
                return next(err);
            }
            req.flash('success',`Welcome to YelpCamp ${registeredUser.username}!`);
            res.redirect('/campgrounds');
        })

    }catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
    // console.log(registeredUser);

}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    // console.log(req.body);
    // console.log(req.user);
    // req.flash('success', `Welcome back, ${req.body.username}!`);
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo; //CIUDAT CA E NECESAR :(
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    // console.log(req.user);
    const name = req.user.username;
    req.logout();
    req.flash('success', `Goodbye ${name}`)
    res.redirect('/campgrounds');
}

// module.exports.

