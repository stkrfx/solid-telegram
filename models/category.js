const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  title: String,
  icon: String,
});

module.exports = mongoose.model("Category", categorySchema);
