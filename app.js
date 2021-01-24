const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  res.render('home');
});

app.listen(3000, () => {
  console.log('App is listening on port 3000!');
});
