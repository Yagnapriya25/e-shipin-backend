const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar:{type:String},
    otp: { type: String },
    otpExpires: { type: Date }
});

const User = mongoose.model('User', userSchema)

module.exports = {User};
