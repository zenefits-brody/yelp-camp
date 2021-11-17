const mongoose = require('mongoose');

const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20 + 5);
    const newCampground = new Campground({
      author: '618337c7c739b132f71df86f',
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      image: 'https://source.unsplash.com/collection/429524',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam esse eius fugit error non aut, dolorem, velit, harum repellat adipisci vel exercitationem! Nulla eveniet necessitatibus cumque laudantium, eaque accusamus maxime.',
      price,
    });
    await newCampground.save();
  }

  console.log('Seed finished!');
};

seedDB().then(() => {
  mongoose.connection.close();
});
