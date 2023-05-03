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