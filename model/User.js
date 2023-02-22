const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
<<<<<<< HEAD
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
  },
  password: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  refreshToken: String,
=======
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
        unique: true
    },
    roles: {
        User: {
            type: Number,
            default: 2001
        },
        Student: Number,
        Teacher: Number
    },
    password: {
        type: String,
        required: true
    },
    picture: {
        type: String,
    },
    refreshToken: String
>>>>>>> 919e70bf5b970d0cf19bb85c0ef80c61d64ef78a
});

module.exports = mongoose.model("User", userSchema);
