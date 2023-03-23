const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/cathAsync');
const campgrounds = require('../routers/campgrounds')
mongoose.set('strictQuery', true);
const { campgroundSchema } = require('../schemas');

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

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400);
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.get('/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id }).populate('reviews');
    res.render('campgrounds/show', { camp });
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { ...req.body.campground });
    res.redirect(`/campgrounds/${req.params.id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndDelete({ _id: id });
    res.redirect('/campgrounds');
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id });
    res.render('campgrounds/edit', { camp });
}))

module.exports = router;