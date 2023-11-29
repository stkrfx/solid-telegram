const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  profilePicture: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
