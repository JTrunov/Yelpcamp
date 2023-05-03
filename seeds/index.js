const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const { places, descriptors } = require('./seedHelpers')
const cities = require('./cities');
mongoose.set('strictQuery', true)


// mongoose connection function
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

    console.log('connected to mongoose');
}

main().catch(err => console.log(err));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 1;
        const camp = new Campground({
            author: '643fdbc5fba7e88aecf719fc',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dzv42c9gd/image/upload/v1682673906/Yelpcamp/fhchpuzg67x6okwfyda1.jpg',
                    file: 'Yelpcamp/fhchpuzg67x6okwfyda1',
                },
                {
                    url: 'https://res.cloudinary.com/dzv42c9gd/image/upload/v1682673907/Yelpcamp/h6j828qc7up9trtjm58i.jpg',
                    file: 'Yelpcamp/h6j828qc7up9trtjm58i',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto porro provident nam corrupti consequuntur nulla, tempore quas doloremque placeat, nihil consequatur hic dolorem illo. Minima, blanditiis et. Voluptate, eligendi aperiam.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [61.402555, 55.159841]
            }
        });
        await camp.save();
    }
    console.log('Done!')
}

seedDB();
