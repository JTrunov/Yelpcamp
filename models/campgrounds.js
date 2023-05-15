const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

let imageSchema = new Schema({
    url: String,
    file: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opt = { toJSON: { virtuals: true } };


const campgroundSchema = new Schema({
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },

        coordinates: {
            type: [Number],
            required: true
        }
    },
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, ref: 'Review'
        }
    ]
}, opt);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href='/campgrounds/${this._id}'>${this.title}</a>
    <p>${this.description.substring(0, 30)}...</p>`;
});


campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);