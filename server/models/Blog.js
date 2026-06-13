const mongoose = require('mongoose')

const blogBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['paragraph', 'quote', 'image', 'video', 'link'],
      default: 'paragraph'
    },
    text: {
      type: String,
      default: '',
      trim: true
    },
    url: {
      type: String,
      default: '',
      trim: true
    },
    caption: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: false }
)

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Travel',
      trim: true
    },
    excerpt: {
      type: String,
      default: '',
      trim: true
    },
    coverImage: {
      type: String,
      default: '',
      trim: true
    },
    readTime: {
      type: String,
      default: '5 min read',
      trim: true
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    blocks: {
      type: [blogBlockSchema],
      default: []
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

blogSchema.index({ publishedAt: -1 })
blogSchema.index({ isPublished: 1, publishedAt: -1 })

module.exports = mongoose.model('Blog', blogSchema)
