const mongoose = require('mongoose')

const galleryImageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      default: 'gallery image',
      trim: true
    },
    location: {
      type: String,
      default: 'New upload',
      trim: true
    },
    mood: {
      type: String,
      default: 'Fresh frame',
      trim: true
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
)

galleryImageSchema.index({ createdAt: -1 })

module.exports = mongoose.model('GalleryImage', galleryImageSchema)
