const Campground = require('../models/campgrounds');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400);
    const camp = new Campground(req.body.campground);
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Successfully added campground!!');
    res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}