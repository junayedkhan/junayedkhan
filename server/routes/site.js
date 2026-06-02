const router = require('express').Router()
const SiteSetting = require('../models/SiteSetting')
const GalleryImage = require('../models/GalleryImage')
const authMiddleware = require('../middleware/authMiddleware')

const HERO_IMAGE_KEY = 'heroImage'
const HERO_CONTENT_KEY = 'heroContent'
const MAX_DATA_IMAGE_LENGTH = 3_500_000
const MAX_GALLERY_IMAGE_LENGTH = 4_500_000

const normalizeImage = (image) => String(image || '').trim()
const normalizeText = (value) => String(value || '').trim()
const normalizeRoles = (roles) => {
  if (Array.isArray(roles)) {
    return roles.map((role) => normalizeText(role)).filter(Boolean).slice(0, 4)
  }

  return String(roles || '')
    .split(',')
    .map((role) => normalizeText(role))
    .filter(Boolean)
    .slice(0, 4)
}

const isAllowedImageSource = (image) => {
  if (!image) return false
  if (/^https?:\/\/.+/i.test(image)) return true
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(image) && image.length <= MAX_DATA_IMAGE_LENGTH) return true
  return false
}

const isAllowedGalleryImageSource = (image) => {
  if (!image) return false
  if (/^https?:\/\/.+/i.test(image)) return true
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(image) && image.length <= MAX_GALLERY_IMAGE_LENGTH) return true
  return false
}

const serializeGalleryImage = (image) => ({
  id: String(image._id),
  img: image.image,
  alt: image.alt,
  location: image.location,
  mood: image.mood,
  likes: image.likes,
  source: 'Uploaded',
  createdAt: image.createdAt
})

const getHeroImage = async () => {
  const content = await getHeroContent()
  return content?.image || ''
}

const getHeroContent = async () => {
  const contentSetting = await SiteSetting.findOne({ key: HERO_CONTENT_KEY }).lean()
  const savedContent = contentSetting?.value || {}

  if (!contentSetting) {
    return null
  }

  return {
    name: normalizeText(savedContent.name),
    designation: Array.isArray(savedContent.designation) ? savedContent.designation : normalizeRoles(savedContent.designation),
    description: normalizeText(savedContent.description),
    image: normalizeImage(savedContent.image)
  }
}

router.get('/hero', async (req, res) => {
  try {
    res.json({ content: await getHeroContent() })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load hero content' })
  }
})

router.get('/admin/hero', authMiddleware, async (req, res) => {
  try {
    const content = await getHeroContent()
    res.json({ ...(content || {}), content })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load hero content' })
  }
})

router.put('/admin/hero', authMiddleware, async (req, res) => {
  try {
    const image = normalizeImage(req.body.image)
    const name = normalizeText(req.body.name)
    const description = normalizeText(req.body.description)
    const designation = normalizeRoles(req.body.designation)

    if (!isAllowedImageSource(image)) {
      return res.status(400).json({ message: 'Use a valid image URL or a PNG, JPG, or WebP image under 2.5 MB.' })
    }

    if (!name) {
      return res.status(400).json({ message: 'Hero name is required.' })
    }

    if (!designation.length) {
      return res.status(400).json({ message: 'Add at least one hero role.' })
    }

    if (!description) {
      return res.status(400).json({ message: 'Hero description is required.' })
    }

    const content = { name, designation, description, image }
    const setting = await SiteSetting.findOneAndUpdate(
      { key: HERO_CONTENT_KEY },
      { value: content },
      { new: true, upsert: true }
    )

    await SiteSetting.deleteOne({ key: HERO_IMAGE_KEY })

    res.json({ message: 'Hero content updated', ...setting.value, content: setting.value })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update hero content' })
  }
})

router.delete('/admin/hero', authMiddleware, async (req, res) => {
  try {
    await SiteSetting.deleteOne({ key: HERO_IMAGE_KEY })
    await SiteSetting.deleteOne({ key: HERO_CONTENT_KEY })
    res.json({ message: 'Hero content removed', content: null })
  } catch (err) {
    res.status(500).json({ message: 'Unable to reset hero content' })
  }
})

router.get('/gallery', async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 }).lean()
    res.json({ images: images.map(serializeGalleryImage) })
  } catch (err) {
    console.error('Unable to load gallery images:', err.message)
    res.status(500).json({ message: 'Unable to load gallery images' })
  }
})

router.get('/admin/gallery', authMiddleware, async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 }).lean()
    res.json({ images: images.map(serializeGalleryImage) })
  } catch (err) {
    console.error('Unable to load admin gallery images:', err.message)
    res.status(500).json({ message: 'Unable to load gallery images' })
  }
})

router.post('/admin/gallery', authMiddleware, async (req, res) => {
  try {
    const image = normalizeImage(req.body.image || req.body.img)
    const alt = normalizeText(req.body.alt) || 'gallery image'
    const location = normalizeText(req.body.location) || 'New upload'
    const mood = normalizeText(req.body.mood) || 'Fresh frame'
    const likes = Math.max(Number(req.body.likes) || 0, 0)

    if (!isAllowedGalleryImageSource(image)) {
      return res.status(400).json({ message: 'Use a valid image URL or a PNG, JPG, or WebP image under 3 MB.' })
    }

    const createdImage = await GalleryImage.create({ image, alt, location, mood, likes })
    res.status(201).json({ message: 'Gallery image added', image: serializeGalleryImage(createdImage) })
  } catch (err) {
    console.error('Unable to add gallery image:', err.message)
    res.status(500).json({ message: 'Unable to add gallery image' })
  }
})

router.patch('/admin/gallery/:id', authMiddleware, async (req, res) => {
  try {
    const updates = {}

    if (req.body.alt !== undefined) updates.alt = normalizeText(req.body.alt) || 'gallery image'
    if (req.body.location !== undefined) updates.location = normalizeText(req.body.location) || 'New upload'
    if (req.body.mood !== undefined) updates.mood = normalizeText(req.body.mood) || 'Fresh frame'
    if (req.body.likes !== undefined) updates.likes = Math.max(Number(req.body.likes) || 0, 0)

    const image = await GalleryImage.findByIdAndUpdate(req.params.id, updates, { new: true })

    if (!image) {
      return res.status(404).json({ message: 'Gallery image not found' })
    }

    res.json({ message: 'Gallery image updated', image: serializeGalleryImage(image) })
  } catch (err) {
    console.error('Unable to update gallery image:', err.message)
    res.status(500).json({ message: 'Unable to update gallery image' })
  }
})

router.patch('/gallery/:id/like', async (req, res) => {
  try {
    const liked = Boolean(req.body.liked)
    const increment = liked ? 1 : -1
    const image = await GalleryImage.findById(req.params.id)

    if (!image) {
      return res.status(404).json({ message: 'Gallery image not found' })
    }

    image.likes = Math.max((image.likes || 0) + increment, 0)
    await image.save()

    res.json({ image: serializeGalleryImage(image) })
  } catch (err) {
    console.error('Unable to update gallery like:', err.message)
    res.status(500).json({ message: 'Unable to update gallery like' })
  }
})

router.delete('/admin/gallery/:id', authMiddleware, async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id)

    if (!image) {
      return res.status(404).json({ message: 'Gallery image not found' })
    }

    res.json({ message: 'Gallery image removed' })
  } catch (err) {
    console.error('Unable to remove gallery image:', err.message)
    res.status(500).json({ message: 'Unable to remove gallery image' })
  }
})

module.exports = router
