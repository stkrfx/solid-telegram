const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  date: Date,
  user: String,
  type: String,
  likes: Array,
  views: Array,
  title: String,
  source: String,
  poster: String,
  description: String,
  reported: Array,
  duration: String,
  comments: Number,
  lastComment: String,
  youtubeVideo: Boolean,
  isAd: Boolean,
});

contentSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Content", contentSchema);
