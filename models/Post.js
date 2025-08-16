const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  slug: String,
  status: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  category: String,
  imageUrl: String
});

module.exports = mongoose.model("Post", postSchema);
