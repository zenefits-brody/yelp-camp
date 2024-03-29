const ejsMate = require('ejs-mate');
const express = require('express');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const passportLocal = require('passport-local');
const path = require('path');
const session = require('express-session');

const campgroudRoutes = require('./routes/campgrounds');
const userRoutes = require('./routes/users');
const AppError = require('./AppError');
const User = require('./models/user');

const LocalStrategy = passportLocal.Strategy;

mongoose
  .connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'this should be a better secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
app.use(flash());
app.use(passport.initialize());
// This needs to be after app.use(session(...))
// https://www.npmjs.com/package/passport
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // By doing this, we will have access to these fields in our templates.
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/admin', (req, res) => {
  throw new AppError('You are not an admin.', 403);
});

app.use('/campgrounds', campgroudRoutes);

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
