// User schema 만들기
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password : {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlenght: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: { //token의 유효기간
        type: Number
    }
})

const User = mongoose.model('User', userSchema)
module.exports = {User}