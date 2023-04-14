const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/cathAsync');
const Review = require('../models/review');
mongoose.set('strictQuery', true);
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// mergeParams for keeping params from reviews.js for app.js
const router = express.Router({ mergeParams: true });



router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findOne({ _id: id });
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { $pull: { reviews: reviewId } });
    await Review.findOneAndDelete({ _id: reviewId });
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;