const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const Campground = require('./models/campground');

mongoose
  .connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Mongo connection success!');
  })
  .catch((error) => {
    console.log('Mongo connection failed!');
    console.log(error);
  });

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  console.log(campgrounds[0]);
  res.render('campgrounds/index', { campgrounds });
});

app.listen(3000, () => {
  console.log('App is listening on port 3000!');
});
