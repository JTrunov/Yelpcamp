const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/cathAsync');
const campgrounds = require('../routers/campgrounds')
mongoose.set('strictQuery', true);
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');

const router = express.Router();

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400);
    const camp = new Campground(req.body.campground);
    await camp.save();
    req.flash('success', 'Successfully added campground!!');
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.get('/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id }).populate('reviews');
    if (!camp) {
        req.flash('error', 'Cannot find a campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}))

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { ...req.body.campground });
    req.flash('success', 'Successfully updated a campground!');
    res.redirect(`/campgrounds/${req.params.id}`);
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndDelete({ _id: id });
    req.flash('success', 'sucessfully deleted a campground!');
    res.redirect('/campgrounds');
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id });
    if (!camp) {
        req.flash('error', 'Cannot find a campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
}))



module.exports = router;