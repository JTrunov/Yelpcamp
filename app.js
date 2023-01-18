const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true)


// mongoose connection function
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

    console.log('connected to mongoose');
}

main().catch(err => console.log(err));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
})

app.listen(3000, () => {
    console.log('Listening on port 3000!');
})
