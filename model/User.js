const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  surname: {
    type: String,
  },
  studentNumber: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Student: Number,
    Teacher: Number,
    Admin: Number,
  },
  password: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: "storage/user_storage/default/default.png"
  },
  refreshToken: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
