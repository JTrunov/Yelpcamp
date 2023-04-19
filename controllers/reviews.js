const Campground = require('../models/campgrounds');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findOne({ _id: id });
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { $pull: { reviews: reviewId } });
    await Review.findOneAndDelete({ _id: reviewId });
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
};