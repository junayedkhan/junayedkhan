const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  age: {
    type: Number,
    min: 0
  },
  address: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  accountVerificationCode: String,
  accountVerificationExpires: Date,
  accountVerifiedUntil: Date
})

module.exports = mongoose.model('User', userSchema)
