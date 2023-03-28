const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/cathAsync');
const Review = require('../models/review');
mongoose.set('strictQuery', true);
const { reviewSchema } = require('../schemas');

// mergeParams for keeping params from reviews.js for app.js
const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findOne({ _id: id });
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { $pull: { reviews: reviewId } });
    await Review.findOneAndDelete({ _id: reviewId });
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;