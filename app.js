const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  res.send('Hello from Yelp Camp!');
});

app.listen(3000, () => {
  console.log('App is listening on port 3000!');
});
