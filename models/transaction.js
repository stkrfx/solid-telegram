const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  date: Date,
  user: String,
  amount: Number,
  descritpion: String,
  Status: String,
  upiId: String,
  transactionId: String,
});

module.exports = mongoose.model("Transaciton", transactionSchema);
