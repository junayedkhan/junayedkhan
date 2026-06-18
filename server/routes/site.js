const router = require('express').Router()
const SiteSetting = require('../models/SiteSetting')
const GalleryImage = require('../models/GalleryImage')
const authMiddleware = require('../middleware/authMiddleware')

const HERO_IMAGE_KEY = 'heroImage'
const HERO_CONTENT_KEY = 'heroContent'
const ABOUT_CONTENT_KEY = 'aboutContent'
const SERVER_HERO_CONTENT = {
  name: 'Junayed Khan',
  designation: ['Travel Explorer', 'Story Keeper', 'Photo Lover'],
  description: 'I share personal moments, travel stories, and visual memories from places, people, and quiet details that make every journey feel meaningful.',
  image: 'assets/image/home.png'
}
const SERVER_ABOUT_CONTENT = {
  image: '',
  name: 'Junayed Khan',
  label: 'About Me',
  title: 'Hi, I am Junayed Khan',
  description: 'I am focused on building a clean personal portfolio where my travel moments, creative ideas, and personal brand can be presented in a professional way. My goal is to make the page feel simple, visual, and easy to explore.',
  status: 'Available',
  personalInfo: [
    { label: 'Name', value: 'Junayed Khan' },
    { label: 'Focus', value: 'Creative Portfolio' },
    { label: 'Location', value: 'Dhaka, Bangladesh' },
    { label: 'Language', value: 'Bangla, English' },
    { label: 'Availability', value: 'Open to collaborate' },
    { label: 'Project Type', value: 'Travel, portfolio, personal brand' }
  ],
  expertise: [
    { title: 'Travel Storytelling', text: 'Sharing places, moments, and experiences through clean visuals and simple storytelling.' },
    { title: 'Portfolio Presentation', text: 'Organizing photos, work, and personal identity into a polished modern portfolio.' },
    { title: 'Creative Direction', text: 'Choosing layout, mood, color, and content flow so the page feels professional and personal.' }
  ],
  skills: ['Travel Content', 'Portfolio Design', 'Photo Gallery', 'Personal Branding', 'Figma', 'Canva', 'Basic Web', 'Visual Story'],
  education: [
    { year: '2024 - Present', title: 'Creative Portfolio Building', text: 'Learning how to present personal work, travel content, and visual stories professionally.' },
    { year: '2022 - 2024', title: 'Creative Design Practice', text: 'Focused on layout, color, typography, portfolio design, and clean user experience.' }
  ],
  ctaText: 'Connect With Me',
  ctaPath: '/contact'
}
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

const normalizeInfoItems = (items, fallback = []) => {
  if (!Array.isArray(items)) return fallback
  const normalized = items
    .map((item) => ({
      label: normalizeText(item?.label).slice(0, 80),
      value: normalizeText(item?.value).slice(0, 140)
    }))
    .filter((item) => item.label && item.value)
    .slice(0, 12)
  return normalized.length ? normalized : fallback
}

const normalizeExpertiseItems = (items, fallback = []) => {
  if (!Array.isArray(items)) return fallback
  const normalized = items
    .map((item) => ({
      title: normalizeText(item?.title).slice(0, 100),
      text: normalizeText(item?.text).slice(0, 260)
    }))
    .filter((item) => item.title && item.text)
    .slice(0, 6)
  return normalized.length ? normalized : fallback
}

const normalizeSkillItems = (items, fallback = []) => {
  const rawItems = Array.isArray(items) ? items : String(items || '').split(',')
  const normalized = rawItems.map((item) => normalizeText(item).slice(0, 40)).filter(Boolean).slice(0, 16)
  return normalized.length ? normalized : fallback
}

const normalizeEducationItems = (items, fallback = []) => {
  if (!Array.isArray(items)) return fallback
  const normalized = items
    .map((item) => ({
      year: normalizeText(item?.year).slice(0, 60),
      title: normalizeText(item?.title).slice(0, 120),
      text: normalizeText(item?.text).slice(0, 280)
    }))
    .filter((item) => item.year && item.title && item.text)
    .slice(0, 6)
  return normalized.length ? normalized : fallback
}

const buildDefaultAboutTabs = (content = SERVER_ABOUT_CONTENT) => [
  { id: 'expertise', type: 'expertise', title: 'What I Work With', visible: true, items: content.expertise || SERVER_ABOUT_CONTENT.expertise },
  { id: 'personalInfo', type: 'info', title: 'Personal Info', visible: true, items: content.personalInfo || SERVER_ABOUT_CONTENT.personalInfo },
  { id: 'skills', type: 'skills', title: 'Skills & Tools', visible: true, items: content.skills || SERVER_ABOUT_CONTENT.skills },
  { id: 'education', type: 'education', title: 'Education', visible: true, items: content.education || SERVER_ABOUT_CONTENT.education }
]

const normalizeAboutTabs = (tabs, content = SERVER_ABOUT_CONTENT) => {
  const savedTabs = Array.isArray(tabs) ? tabs : []
  const defaultTabs = buildDefaultAboutTabs(content).map((defaultTab) => {
    const savedTab = savedTabs.find((tab) => tab?.id === defaultTab.id || tab?.type === defaultTab.type) || {}
    const tab = {
      ...defaultTab,
      title: normalizeText(savedTab.title) || defaultTab.title,
      visible: savedTab.visible !== false
    }

    if (defaultTab.type === 'info') tab.items = normalizeInfoItems(savedTab.items || content.personalInfo, defaultTab.items)
    if (defaultTab.type === 'expertise') tab.items = normalizeExpertiseItems(savedTab.items || content.expertise, defaultTab.items)
    if (defaultTab.type === 'skills') tab.items = normalizeSkillItems(savedTab.items || content.skills, defaultTab.items)
    if (defaultTab.type === 'education') tab.items = normalizeEducationItems(savedTab.items || content.education, defaultTab.items)

    return tab
  })

  const customTabs = savedTabs
    .filter((tab) => tab?.type === 'custom')
    .map((tab, index) => ({
      id: normalizeText(tab.id) || `custom-${index}`,
      type: 'custom',
      title: normalizeText(tab.title).slice(0, 100) || 'New Tab',
      visible: tab.visible !== false,
      text: normalizeText(tab.text).slice(0, 1200)
    }))
    .filter((tab) => tab.title && tab.text)
    .slice(0, 8)

  return [...defaultTabs, ...customTabs]
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

const setPublicDataCache = (res) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
}

const getHeroImage = async () => {
  const content = await getHeroContent()
  return content?.image || ''
}

const getHeroContent = async () => {
  const contentSetting = await SiteSetting.findOne({ key: HERO_CONTENT_KEY }).lean()
  const savedContent = contentSetting?.value || {}

  if (!contentSetting) {
    return SERVER_HERO_CONTENT
  }

  return {
    name: normalizeText(savedContent.name) || SERVER_HERO_CONTENT.name,
    designation: normalizeRoles(savedContent.designation).length ? normalizeRoles(savedContent.designation) : SERVER_HERO_CONTENT.designation,
    description: normalizeText(savedContent.description) || SERVER_HERO_CONTENT.description,
    image: normalizeImage(savedContent.image) || SERVER_HERO_CONTENT.image
  }
}

const getAboutContent = async () => {
  const contentSetting = await SiteSetting.findOne({ key: ABOUT_CONTENT_KEY }).lean()
  const savedContent = contentSetting?.value || {}

  if (!contentSetting) {
    return { ...SERVER_ABOUT_CONTENT, tabs: buildDefaultAboutTabs(SERVER_ABOUT_CONTENT) }
  }

  const content = {
    image: normalizeImage(savedContent.image) || SERVER_ABOUT_CONTENT.image,
    name: normalizeText(savedContent.name) || SERVER_ABOUT_CONTENT.name,
    label: normalizeText(savedContent.label) || SERVER_ABOUT_CONTENT.label,
    title: normalizeText(savedContent.title) || SERVER_ABOUT_CONTENT.title,
    description: normalizeText(savedContent.description) || SERVER_ABOUT_CONTENT.description,
    status: normalizeText(savedContent.status) || SERVER_ABOUT_CONTENT.status,
    personalInfo: normalizeInfoItems(savedContent.personalInfo, SERVER_ABOUT_CONTENT.personalInfo),
    expertise: normalizeExpertiseItems(savedContent.expertise, SERVER_ABOUT_CONTENT.expertise),
    skills: normalizeSkillItems(savedContent.skills, SERVER_ABOUT_CONTENT.skills),
    education: normalizeEducationItems(savedContent.education, SERVER_ABOUT_CONTENT.education),
    ctaText: normalizeText(savedContent.ctaText) || SERVER_ABOUT_CONTENT.ctaText,
    ctaPath: normalizeText(savedContent.ctaPath) || SERVER_ABOUT_CONTENT.ctaPath
  }

  return { ...content, tabs: normalizeAboutTabs(savedContent.tabs, content) }
}

router.get('/hero', async (req, res) => {
  try {
    setPublicDataCache(res)
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

router.get('/about', async (req, res) => {
  try {
    setPublicDataCache(res)
    res.json({ content: await getAboutContent() })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load about content' })
  }
})

router.get('/admin/about', authMiddleware, async (req, res) => {
  try {
    const content = await getAboutContent()
    res.json({ ...(content || {}), content })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load about content' })
  }
})

router.put('/admin/about', authMiddleware, async (req, res) => {
  try {
    const image = normalizeImage(req.body.image)

    if (image && !isAllowedGalleryImageSource(image)) {
      return res.status(400).json({ message: 'Use a valid image URL or a PNG, JPG, or WebP image under 3 MB.' })
    }

    const content = {
      image,
      name: normalizeText(req.body.name) || SERVER_ABOUT_CONTENT.name,
      label: normalizeText(req.body.label) || SERVER_ABOUT_CONTENT.label,
      title: normalizeText(req.body.title) || SERVER_ABOUT_CONTENT.title,
      description: normalizeText(req.body.description) || SERVER_ABOUT_CONTENT.description,
      status: normalizeText(req.body.status) || SERVER_ABOUT_CONTENT.status,
      personalInfo: normalizeInfoItems(req.body.personalInfo, SERVER_ABOUT_CONTENT.personalInfo),
      expertise: normalizeExpertiseItems(req.body.expertise, SERVER_ABOUT_CONTENT.expertise),
      skills: normalizeSkillItems(req.body.skills, SERVER_ABOUT_CONTENT.skills),
      education: normalizeEducationItems(req.body.education, SERVER_ABOUT_CONTENT.education),
      ctaText: normalizeText(req.body.ctaText) || SERVER_ABOUT_CONTENT.ctaText,
      ctaPath: normalizeText(req.body.ctaPath) || SERVER_ABOUT_CONTENT.ctaPath
    }

    content.tabs = normalizeAboutTabs(req.body.tabs, content)

    const setting = await SiteSetting.findOneAndUpdate(
      { key: ABOUT_CONTENT_KEY },
      { value: content },
      { new: true, upsert: true }
    )

    res.json({ message: 'About content updated', ...setting.value, content: setting.value })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update about content' })
  }
})

router.delete('/admin/about', authMiddleware, async (req, res) => {
  try {
    await SiteSetting.deleteOne({ key: ABOUT_CONTENT_KEY })
    res.json({ message: 'About content reset', content: { ...SERVER_ABOUT_CONTENT, tabs: buildDefaultAboutTabs(SERVER_ABOUT_CONTENT) } })
  } catch (err) {
    res.status(500).json({ message: 'Unable to reset about content' })
  }
})

router.get('/gallery', async (req, res) => {
  try {
    setPublicDataCache(res)
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
