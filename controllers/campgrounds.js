const Campground = require('../models/campgrounds');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campResult = await Campground.find({});
    const campgrounds = campResult.reverse();
    res.render('campgrounds/index', { campgrounds });
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const camp = new Campground(req.body.campground);
    camp.geometry = geoData.body.features[0].geometry
    camp.images = req.files.map(f => ({ url: f.path, file: f.filename }));
    camp.author = req.user._id;
    await camp.save();
    console.log(camp);
    req.flash('success', 'Successfully added campground!!');
    res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.showCampground = async (req, res) => {
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
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findOne({ _id: id });
    res.render('campgrounds/edit', { camp });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findOneAndUpdate({ _id: id }, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, file: f.filename }));
    camp.images.push(...imgs);
    await camp.save();
    const deleteImages = req.body.deleteImages;
    if (deleteImages) {
        for (let file of deleteImages) {
            await cloudinary.uploader.destroy(file)
        }
        await camp.updateOne({ $pull: { images: { file: { $in: deleteImages } } } });
        console.log(camp);
    }
    req.flash('success', 'Successfully updated a campground!');
    res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findOneAndDelete({ _id: id });
    req.flash('success', 'sucessfully deleted a campground!');
    res.redirect('/campgrounds');
};