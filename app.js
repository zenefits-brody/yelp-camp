const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');

const Campground = require('./models/campground');
const Review = require('./models/review');
const AppError = require('./AppError');
const { campgroundValidateSchema } = require('./joiSchemas');

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

// A wrapper function to handle async errors
// This won't be needed with express v5
const wrapAsync = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

const validateCampground = (req, res, next) => {
  const { error } = campgroundValidateSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(', ');
    throw new AppError(message, 400);
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/admin', (req, res) => {
  throw new AppError('You are not an admin.', 403);
});

app.get(
  '/campgrounds',
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  }),
);

// This route needs to be defined before `/campgrounds/:id` route, otherwise we can never enter this route.
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.get(
  '/campgrounds/:id',
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      throw new AppError('Campground not found.', 404);
    }
    res.render('campgrounds/show', { campground });
  }),
);

app.get(
  '/campgrounds/:id/edit',
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  }),
);

/**
 * POST routes
 */

app.post(
  '/campgrounds',
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

app.post(
  '/campgrounds/:id/reviews',
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

/**
 * PUT routes
 */

app.put(
  '/campgrounds/:id',
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!req.body.campground.title) {
      throw new AppError('Campground should have a title.', 500);
    }
    await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${id}`);
  }),
);

/**
 * DELETE routes
 */

app.delete(
  '/campgrounds/:id',
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  }),
);

app.use((req, res, next) => {
  next(new AppError('Page Not Found.', 404));
});

// Error handling middleware.
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  err.message = err.message || 'Something went wrong.';
  res.status(status).render('error', { err });
});

app.listen(3000, () => {
  console.log('App is listening on port 3000!');
});
