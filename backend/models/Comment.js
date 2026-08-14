const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000,
  },
  tmdb_id: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
