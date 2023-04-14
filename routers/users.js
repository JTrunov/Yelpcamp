const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/cathAsync');
const passport = require('passport');
const { checkReturnUrl } = require('../middleware');


router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({
            username,
            email
        });
        const registerdUser = await User.register(user, password);
        req.login(registerdUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelpcamp!');
            res.redirect('/campgrounds');
        })
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', checkReturnUrl, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
}),
    (req, res) => {
        req.flash('success', 'Successfully logged in!');
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        res.redirect(redirectUrl);
    })

router.get('/logout', async (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out!');
        res.redirect('/campgrounds');
    });

})

module.exports = router;