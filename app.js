const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const campgroudRoutes = require('./routes/campgrounds');
const AppError = require('./AppError');

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

app.use((req, res, next) => {
  // By doing this, we will have access to `success` in our templates.
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

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
