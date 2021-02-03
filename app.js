const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

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

// For parsing post request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', async (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

// This route needs to be defined before `/campgrounds/:id` route, otherwise we can never enter this route.
app.get('/campgrounds/new', async (req, res) => {
  res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
});

/**
 * POST routes
 */

app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

/**
 * PUT routes
 */

app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, req.body.campground);
  res.redirect(`/campgrounds/${id}`);
});

/**
 * DELETE routes
 */

app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
});

app.listen(3000, () => {
  console.log('App is listening on port 3000!');
});
