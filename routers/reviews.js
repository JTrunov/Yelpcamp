const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/cathAsync');
mongoose.set('strictQuery', true);
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

// mergeParams for keeping params from reviews.js for app.js
const router = express.Router({ mergeParams: true });



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;