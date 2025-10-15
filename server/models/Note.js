const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;