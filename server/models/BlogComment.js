const mongoose = require('mongoose')

const blogCommentReplySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const blogCommentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    replies: {
      type: [blogCommentReplySchema],
      default: []
    }
  },
  { timestamps: true }
)

blogCommentSchema.index({ blog: 1, createdAt: -1 })

module.exports = mongoose.model('BlogComment', blogCommentSchema)
