const router = require('express').Router()
const SiteSetting = require('../models/SiteSetting')
const authMiddleware = require('../middleware/authMiddleware')

const HERO_IMAGE_KEY = 'heroImage'
const HERO_CONTENT_KEY = 'heroContent'
const DEFAULT_HERO_IMAGE = 'assets/image/home.png'
const DEFAULT_HERO_CONTENT = {
  name: 'Junayed',
  designation: ['Developer', 'Designer'],
  description: 'I build clean, responsive web experiences with thoughtful motion, clear interfaces, and careful attention to every interaction.',
  image: DEFAULT_HERO_IMAGE
}
const MAX_DATA_IMAGE_LENGTH = 3_500_000

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
  if (image === DEFAULT_HERO_IMAGE) return true
  if (/^https?:\/\/.+/i.test(image)) return true
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(image) && image.length <= MAX_DATA_IMAGE_LENGTH) return true
  return false
}

const getHeroImage = async () => {
  const content = await getHeroContent()
  return content.image
}

const getHeroContent = async () => {
  const contentSetting = await SiteSetting.findOne({ key: HERO_CONTENT_KEY }).lean()
  const imageSetting = await SiteSetting.findOne({ key: HERO_IMAGE_KEY }).lean()
  const savedContent = contentSetting?.value || {}
  const legacyImage = imageSetting?.value?.image

  return {
    ...DEFAULT_HERO_CONTENT,
    ...savedContent,
    designation: Array.isArray(savedContent.designation) && savedContent.designation.length
      ? savedContent.designation
      : DEFAULT_HERO_CONTENT.designation,
    image: savedContent.image || legacyImage || DEFAULT_HERO_IMAGE
  }
}

router.get('/hero', async (req, res) => {
  try {
    res.json({ content: await getHeroContent(), defaultContent: DEFAULT_HERO_CONTENT })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load hero content' })
  }
})

router.get('/admin/hero', authMiddleware, async (req, res) => {
  try {
    const content = await getHeroContent()
    res.json({ ...content, content, defaultImage: DEFAULT_HERO_IMAGE, defaultContent: DEFAULT_HERO_CONTENT })
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

    res.json({ message: 'Hero content updated', ...setting.value, content: setting.value, defaultImage: DEFAULT_HERO_IMAGE, defaultContent: DEFAULT_HERO_CONTENT })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update hero content' })
  }
})

router.delete('/admin/hero', authMiddleware, async (req, res) => {
  try {
    await SiteSetting.deleteOne({ key: HERO_IMAGE_KEY })
    await SiteSetting.deleteOne({ key: HERO_CONTENT_KEY })
    res.json({ message: 'Hero content reset to default', ...DEFAULT_HERO_CONTENT, content: DEFAULT_HERO_CONTENT, defaultImage: DEFAULT_HERO_IMAGE, defaultContent: DEFAULT_HERO_CONTENT })
  } catch (err) {
    res.status(500).json({ message: 'Unable to reset hero content' })
  }
})

module.exports = router
