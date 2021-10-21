const express = require('express');

const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../AppError');
const { campgroundValidateSchema, reviewValidateSchema } = require('../joiSchemas');

const router = express.Router();

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

const validateReview = (req, res, next) => {
  const { error } = reviewValidateSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(', ');
    throw new AppError(message, 400);
  } else {
    next();
  }
};

router.get(
  '/',
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  }),
);

// This route needs to be defined before `/:id` route, otherwise we can never enter this route.
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
      throw new AppError('Campground not found.', 404);
    }
    res.render('campgrounds/show', { campground });
  }),
);

router.get(
  '/:id/edit',
  wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  }),
);

/**
 * POST routes
 */

router.post(
  '/',
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

router.post(
  '/:id/reviews',
  validateReview,
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

router.put(
  '/:id',
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

router.delete(
  '/:id',
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  }),
);

router.delete(
  '/:campgroundId/reviews/:reviewId',
  wrapAsync(async (req, res) => {
    const { campgroundId, reviewId } = req.params;
    // $pull: https://docs.mongodb.com/manual/reference/operator/update/pull/
    await Campground.findByIdAndUpdate(campgroundId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${campgroundId}`);
  }),
);

module.exports = router;
