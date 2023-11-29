const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  date: Date,
  poster: String,
  category: String,
  username: String,
  password: String,
  map: String,
  prize: Number,
  entry: Number,
  type: String,
  perKill: Number,
  content: String,
  ranking: Array,
  totalSpots: Number,
  leftSpots: Number,
  rules: String,
  users: [
    {
      gameId: String,
      user: String,
      score: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("Contest", contestSchema);
