const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  date: Date,
  user: String,
  content: String,
  likes: Array,
  message: String,
  edited: Boolean,
  reply: Array,
});

module.exports = mongoose.model("Comment", commentSchema);
