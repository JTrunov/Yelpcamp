const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/cathAsync');
const passport = require('passport');
const { checkReturnUrl } = require('../middleware');
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.createUser));

router.route('/login')
    .get(users.renderLoginForm)
    .post(checkReturnUrl, passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
    }), users.login);

router.get('/logout', catchAsync(users.logout));

module.exports = router;