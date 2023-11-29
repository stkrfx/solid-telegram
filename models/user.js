const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  profilePicture: String,
  name: String,
  mobileNumber: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
  bio: String,
  email: String,
  birthday: Date,
  gender: String,
  website: String,
  followers: Array,
  videoHistory: Array,
  reelHistory: Array,
  contestHistory: Array,
  watchLater: Array,
  following: Array,
  lastActiveStatus: Date,
  weekEarning: Number,
  reported: Array,
  registrationDate: Date,
  wallet: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  accountCreated: Number,
  playedPaidMatch: Number,
  refferal: String,
});

module.exports = mongoose.model("User", userSchema);
