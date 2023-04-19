const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/cathAsync');
const campgrounds = require('../controllers/campgrounds')
mongoose.set('strictQuery', true);
const { campgroundSchema } = require('../schemas');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


const router = express.Router();



router.get('/', catchAsync(campgrounds.index));

router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.get('/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id }).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Cannot find a campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { ...req.body.campground });
    req.flash('success', 'Successfully updated a campground!');
    res.redirect(`/campgrounds/${req.params.id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndDelete({ _id: id });
    req.flash('success', 'sucessfully deleted a campground!');
    res.redirect('/campgrounds');
}))

router.get('/:id/edit', isAuthor, isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findOne({ _id: id });
    res.render('campgrounds/edit', { camp });
}))



module.exports = router;