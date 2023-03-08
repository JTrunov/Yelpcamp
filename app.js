const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campgrounds');
const { urlencoded } = require('express');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/cathAsync');
const { createDecipher } = require('crypto');
const Review = require('./models/review');
mongoose.set('strictQuery', true);
const { campgroundSchema, reviewSchema } = require('./schemas');


// mongoose connection function
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

    console.log('connected to mongoose');
}

main().catch(err => console.log(err));

// basic express setup
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400);
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id }).populate('reviews');
    res.render('campgrounds/show', { camp });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { ...req.body.campground });
    res.redirect(`/campgrounds/${req.params.id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndDelete({ _id: id });
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findOne({ _id: id });
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { $pull: { reviews: reviewId } });
    await Review.findOneAndDelete({ _id: reviewId });
    res.redirect(`/campgrounds/${id}`);
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id });
    res.render('campgrounds/edit', { camp });
}))


// app.get('/makecamp', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', price: 5.55, description: 'cheap camping' });
//     await camp.save();
//     res.send(camp);
// })

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Listening on port 3000!');
})
