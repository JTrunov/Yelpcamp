const { campgroundSchema, reviewSchema } = require('./schemas');
const catchAsync = require('./utils/cathAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campgrounds');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
    next();
};

module.exports.checkReturnUrl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findOne({ _id: id });
    if (!camp) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    if (!camp.author.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
})

module.exports.isReviewAuthor = catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
})

module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}