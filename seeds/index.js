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
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/random/800x600/?woods,camp',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto porro provident nam corrupti consequuntur nulla, tempore quas doloremque placeat, nihil consequatur hic dolorem illo. Minima, blanditiis et. Voluptate, eligendi aperiam.',
            price
        });
        await camp.save();
    }
    console.log('Done!')
}

seedDB();
