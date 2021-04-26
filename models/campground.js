const mongoose = require('mongoose');

const { Schema } = mongoose;

const CampgroundSchema = new Schema({
  title: { type: String, required: [true, 'Title cannot be empty.'] },
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

module.exports = mongoose.model('Campground', CampgroundSchema);
