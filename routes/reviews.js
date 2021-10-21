const express = require('express');

const { wrapAsync } = require('./utils');
const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../AppError');
const { reviewValidateSchema } = require('../joiSchemas');

const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
  const { error } = reviewValidateSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(', ');
    throw new AppError(message, 400);
  } else {
    next();
  }
};

router.post(
  '/',
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

router.delete(
  '/:reviewId',
  wrapAsync(async (req, res) => {
    const { id: campgroundId, reviewId } = req.params;
    // $pull: https://docs.mongodb.com/manual/reference/operator/update/pull/
    await Campground.findByIdAndUpdate(campgroundId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${campgroundId}`);
  }),
);

module.exports = router;
