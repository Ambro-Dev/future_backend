const mongoose = require('mongoose');
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
});

module.exports = mongoose.model('User', userSchema);