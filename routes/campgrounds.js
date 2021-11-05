const express = require('express');

const reviewRoutes = require('./reviews');
const { wrapAsync } = require('./utils');
const { isLoggedIn } = require('../middleware/middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../AppError');
const { campgroundValidateSchema } = require('../joiSchemas');

const router = express.Router();

const validateCampground = (req, res, next) => {
  const { error } = campgroundValidateSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(', ');
    throw new AppError(message, 400);
  } else {
    next();
  }
};

router.use('/:id/reviews', reviewRoutes);

router.get(
  '/',
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  }),
);

// This route needs to be defined before `/:id` route, otherwise we can never enter this route.
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
      req.flash('error', 'Campground not found.');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
  }),
);

router.get(
  '/:id/edit',
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      req.flash('error', 'Campground not found.');
      return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
  }),
);

/**
 * POST routes
 */

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  wrapAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'New campground created successfully.');
    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

/**
 * PUT routes
 */

router.put(
  '/:id',
  isLoggedIn,
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!req.body.campground.title) {
      throw new AppError('Campground should have a title.', 500);
    }
    await Campground.findByIdAndUpdate(id, req.body.campground);

    req.flash('success', 'Successfully updated campground.');
    res.redirect(`/campgrounds/${id}`);
  }),
);

/**
 * DELETE routes
 */

router.delete(
  '/:id',
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Successfully deleted the campground.');
    res.redirect('/campgrounds');
  }),
);

module.exports = router;
