const express = require('express');
const passport = require('passport');

const { wrapAsync } = require('./utils');
const User = require('../models/user');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/campgrounds');
  },
);

router.post(
  '/register',
  wrapAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);

      req.flash('success', 'Register success!');
      res.redirect('/campgrounds');
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/register');
    }
  }),
);

module.exports = router;
