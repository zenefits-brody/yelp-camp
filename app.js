const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');

const Campground = require('./models/campground');
const AppError = require('./AppError');

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

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// For parsing post request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));

app.get('/', async (req, res) => {
  res.render('home');
});

app.get('/admin', (req, res) => {
  throw new AppError('You are not an admin.', 403);
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

// This route needs to be defined before `/campgrounds/:id` route, otherwise we can never enter this route.
app.get('/campgrounds/new', async (req, res) => {
  res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res, next) => {
  const notFoundError = new AppError('Campground not found.', 404);
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      throw notFoundError;
    }
    res.render('campgrounds/show', { campground });
  } catch (error) {
    next(notFoundError);
  }
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
});

/**
 * POST routes
 */

app.post('/campgrounds', async (req, res, next) => {
  try {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT routes
 */

app.put('/campgrounds/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.body.campground.title) {
      throw new AppError('Campground should have a title.', 500);
    }
    await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${id}`);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE routes
 */

app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
});

app.use((req, res) => {
  res.status(404).send('NOT FOUND!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { status = 500, message = 'Something went wrong.' } = err;
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log('App is listening on port 3000!');
});
