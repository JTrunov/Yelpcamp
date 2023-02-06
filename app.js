const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campgrounds');
const campgrounds = require('./models/campgrounds');
const { urlencoded } = require('express');
mongoose.set('strictQuery', true)


// mongoose connection function
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

    console.log('connected to mongoose');
}

main().catch(err => console.log(err));

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.post('/campgrounds', async (req, res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect('/campgrounds');
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id });
    res.render('campgrounds/show', { camp });
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndUpdate({ _id: id }, { ...req.body.campground });
    res.redirect(`/campgrounds/${req.params.id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndRemove({ _id: id });
    res.redirect('/campgrounds');
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const camp = await Campground.findOne({ _id: req.params.id });
    res.render('campgrounds/edit', { camp });
})


// app.get('/makecamp', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', price: 5.55, description: 'cheap camping' });
//     await camp.save();
//     res.send(camp);
// })

app.listen(3000, () => {
    console.log('Listening on port 3000!');
})
