const router = require('express').Router()
const Blog = require('../models/Blog')
const BlogComment = require('../models/BlogComment')
const authMiddleware = require('../middleware/authMiddleware')

const MAX_DATA_IMAGE_LENGTH = 4_500_000
const MAX_DATA_VIDEO_LENGTH = 7_500_000

const normalizeText = (value) => String(value || '').trim()
const normalizeImage = (image) => String(image || '').trim()
const getSafeDate = (value) => {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}
const formatDate = (value) => new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(getSafeDate(value))
const formatTime = (value) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(getSafeDate(value))
const formatDateTime = (value) => new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format(getSafeDate(value))
const createSlug = (title) => normalizeText(title)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || `blog-${Date.now()}`

const isAllowedUrl = (url) => {
  if (!url) return false
  return /^https?:\/\/.+/i.test(url)
}

const isAllowedImageSource = (image) => {
  if (!image) return false
  if (isAllowedUrl(image)) return true
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(image) && image.length <= MAX_DATA_IMAGE_LENGTH) return true
  return false
}

const isAllowedVideoSource = (video) => {
  if (!video) return false
  if (isAllowedUrl(video)) return true
  if (/^data:video\/(mp4|webm|ogg);base64,/i.test(video) && video.length <= MAX_DATA_VIDEO_LENGTH) return true
  return false
}

const normalizeBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return []

  return blocks
    .map((block) => {
      const type = ['paragraph', 'quote', 'image', 'video', 'link'].includes(block?.type) ? block.type : 'paragraph'
      const text = normalizeText(block?.text)
      const url = normalizeImage(block?.url)
      const caption = normalizeText(block?.caption)

      if (type === 'image') {
        return isAllowedImageSource(url) ? { type, url, caption, text } : null
      }

      if (type === 'video') {
        return isAllowedVideoSource(url) ? { type, url, caption, text } : null
      }

      if (type === 'link') {
        return isAllowedUrl(url) && text ? { type, url, text, caption } : null
      }

      return text ? { type, text, url: '', caption } : null
    })
    .filter(Boolean)
}

const serializeBlog = (blog, commentCount = 0) => ({
  id: String(blog._id),
  title: blog.title,
  slug: blog.slug,
  category: blog.category,
  excerpt: blog.excerpt,
  img: blog.coverImage,
  coverImage: blog.coverImage,
  readTime: blog.readTime,
  meta: formatDate(blog.publishedAt),
  publishedAt: blog.publishedAt,
  blocks: blog.blocks || [],
  isPublished: blog.isPublished,
  commentCount,
  createdAt: blog.createdAt,
  updatedAt: blog.updatedAt
})

const serializeComment = (comment) => ({
  id: String(comment._id),
  blogId: String(comment.blog),
  name: comment.name,
  initials: normalizeText(comment.name).slice(0, 1).toUpperCase() || 'A',
  email: comment.email,
  phone: comment.phone,
  message: comment.message,
  likes: comment.likes,
  isHidden: Boolean(comment.isHidden),
  replies: (comment.replies || []).map((reply) => ({
    id: String(reply._id),
    name: reply.name,
    initials: normalizeText(reply.name).slice(0, 1).toUpperCase() || 'A',
    email: reply.email,
    message: reply.message,
    likes: reply.likes || 0,
    isHidden: Boolean(reply.isHidden),
    date: formatDate(reply.createdAt),
    time: formatTime(reply.createdAt),
    dateTime: formatDateTime(reply.createdAt),
    createdAt: reply.createdAt || new Date()
  })),
  date: formatDate(comment.createdAt),
  time: formatTime(comment.createdAt),
  dateTime: formatDateTime(comment.createdAt),
  createdAt: comment.createdAt || new Date()
})

const serializePublicComment = (comment) => {
  const serialized = serializeComment(comment)
  return {
    ...serialized,
    replies: serialized.replies.filter((reply) => !reply.isHidden)
  }
}

const getCommentCounts = async (blogIds) => {
  const counts = await BlogComment.aggregate([
    { $match: { blog: { $in: blogIds }, isHidden: false } },
    { $group: { _id: '$blog', count: { $sum: 1 } } }
  ])

  return counts.reduce((map, item) => {
    map[String(item._id)] = item.count
    return map
  }, {})
}

const setPublicDataCache = (res) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
}

const getUniqueSlug = async (title, currentId) => {
  const baseSlug = createSlug(title)
  let slug = baseSlug
  let suffix = 2

  while (await Blog.findOne({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) }).lean()) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

const getBlogErrorMessage = (err, fallback) => {
  if (err?.name === 'ValidationError') {
    return Object.values(err.errors || {})[0]?.message || fallback
  }

  if (err?.name === 'CastError') return 'Blog not found.'
  if (err?.code === 11000) return 'A blog with this slug already exists. Try a different title.'

  return err?.message || fallback
}

const buildBlogPayload = async (body, currentId) => {
  const title = normalizeText(body.title)
  const coverImage = normalizeImage(body.coverImage || body.img)
  const blocks = normalizeBlocks(body.blocks)
  const isPublished = body.isPublished !== false

  if (!title) throw new Error('Blog title is required.')
  if (isPublished && !isAllowedImageSource(coverImage)) throw new Error('Use a valid cover image URL or PNG, JPG, or WebP upload.')
  if (isPublished && !blocks.length) throw new Error('Add at least one blog content block.')
  if (coverImage && !isAllowedImageSource(coverImage)) throw new Error('Use a valid cover image URL or PNG, JPG, or WebP upload.')

  return {
    title,
    slug: await getUniqueSlug(title, currentId),
    category: normalizeText(body.category) || 'Travel',
    excerpt: normalizeText(body.excerpt),
    coverImage,
    readTime: normalizeText(body.readTime) || '5 min read',
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
    blocks,
    isPublished
  }
}

router.get('/', async (req, res) => {
  try {
    setPublicDataCache(res)
    const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 }).lean()
    const counts = await getCommentCounts(blogs.map((blog) => blog._id))
    res.json({ blogs: blogs.map((blog) => serializeBlog(blog, counts[String(blog._id)] || 0)) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load blogs' })
  }
})

router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedAt: -1 }).lean()
    const counts = await getCommentCounts(blogs.map((blog) => blog._id))
    res.json({ blogs: blogs.map((blog) => serializeBlog(blog, counts[String(blog._id)] || 0)) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load blogs' })
  }
})

router.get('/admin/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await BlogComment.find().sort({ createdAt: -1 }).populate('blog', 'title slug').lean()
    res.json({
      comments: comments.map((comment) => ({
        ...serializeComment({ ...comment, blog: comment.blog?._id || comment.blog }),
        blogTitle: comment.blog?.title || 'Deleted blog',
        blogSlug: comment.blog?.slug || ''
      }))
    })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load comments' })
  }
})

router.post('/admin', authMiddleware, async (req, res) => {
  try {
    const payload = await buildBlogPayload(req.body)
    const blog = await Blog.create(payload)
    res.status(201).json({ message: payload.isPublished ? 'Blog published' : 'Draft saved', blog: serializeBlog(blog, 0) })
  } catch (err) {
    res.status(400).json({ message: getBlogErrorMessage(err, 'Unable to save blog') })
  }
})

router.put('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const payload = await buildBlogPayload(req.body, req.params.id)
    const blog = await Blog.findByIdAndUpdate(req.params.id, payload, { new: true })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    const commentCount = await BlogComment.countDocuments({ blog: blog._id })
    res.json({ message: payload.isPublished ? 'Blog updated' : 'Draft saved', blog: serializeBlog(blog, commentCount) })
  } catch (err) {
    res.status(400).json({ message: getBlogErrorMessage(err, 'Unable to update blog') })
  }
})

router.delete('/admin/comments/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await BlogComment.findByIdAndDelete(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    res.json({ message: 'Comment deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Unable to delete comment' })
  }
})

router.patch('/admin/comments/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const comment = await BlogComment.findByIdAndUpdate(
      req.params.id,
      { isHidden: Boolean(req.body.isHidden) },
      { new: true }
    ).lean()
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    res.json({ message: comment.isHidden ? 'Comment hidden' : 'Comment visible', comment: serializeComment(comment) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update comment visibility' })
  }
})

router.patch('/admin/comments/:id/replies/:replyId/visibility', authMiddleware, async (req, res) => {
  try {
    const comment = await BlogComment.findOneAndUpdate(
      { _id: req.params.id, 'replies._id': req.params.replyId },
      { $set: { 'replies.$.isHidden': Boolean(req.body.isHidden) } },
      { new: true }
    ).lean()
    if (!comment) return res.status(404).json({ message: 'Reply not found' })
    res.json({ message: Boolean(req.body.isHidden) ? 'Reply hidden' : 'Reply visible', comment: serializeComment(comment) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update reply visibility' })
  }
})

router.delete('/admin/comments/:id/replies/:replyId', authMiddleware, async (req, res) => {
  try {
    const comment = await BlogComment.findByIdAndUpdate(
      req.params.id,
      { $pull: { replies: { _id: req.params.replyId } } },
      { new: true }
    ).lean()
    if (!comment) return res.status(404).json({ message: 'Reply not found' })
    res.json({ message: 'Reply deleted', comment: serializeComment(comment) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to delete reply' })
  }
})

router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    await BlogComment.deleteMany({ blog: blog._id })
    res.json({ message: 'Blog deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Unable to delete blog' })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    setPublicDataCache(res)
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).lean()
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    const commentCount = await BlogComment.countDocuments({ blog: blog._id })
    res.json({ blog: serializeBlog(blog, commentCount) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load blog' })
  }
})

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await BlogComment.find({ blog: req.params.id, isHidden: false }).sort({ createdAt: -1 }).lean()
    res.json({ comments: comments.map(serializePublicComment) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load comments' })
  }
})

router.post('/comments/:id/like', async (req, res) => {
  try {
    const liked = Boolean(req.body.liked)
    const comment = await BlogComment.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: liked ? 1 : -1 } },
      { new: true }
    ).lean()
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    if (comment.likes < 0) {
      await BlogComment.findByIdAndUpdate(req.params.id, { likes: 0 })
      comment.likes = 0
    }
    res.json({ message: liked ? 'Comment liked' : 'Comment unliked', comment: serializeComment(comment) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update like' })
  }
})

router.post('/comments/:id/replies', async (req, res) => {
  try {
    const comment = await BlogComment.findById(req.params.id)
    if (!comment || comment.isHidden) return res.status(404).json({ message: 'Comment not found' })

    const name = normalizeText(req.body.name)
    const email = normalizeText(req.body.email).toLowerCase()
    const message = normalizeText(req.body.message)

    if (!name) return res.status(400).json({ message: 'Name is required.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Valid email is required.' })
    if (!message) return res.status(400).json({ message: 'Reply message is required.' })

    comment.replies.push({ name, email, message })
    await comment.save()
    const reply = comment.replies[comment.replies.length - 1]
    res.status(201).json({ message: 'Reply submitted', reply: serializeComment(comment).replies.find((item) => item.id === String(reply._id)) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to submit reply' })
  }
})

router.post('/comments/:id/replies/:replyId/like', async (req, res) => {
  try {
    const increment = Boolean(req.body.liked) ? 1 : -1
    const comment = await BlogComment.findOneAndUpdate(
      { _id: req.params.id, 'replies._id': req.params.replyId },
      { $inc: { 'replies.$.likes': increment } },
      { new: true }
    ).lean()
    if (!comment) return res.status(404).json({ message: 'Reply not found' })
    res.json({ message: Boolean(req.body.liked) ? 'Reply liked' : 'Reply unliked', comment: serializeComment(comment) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update reply like' })
  }
})

router.post('/:id/comments', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean()
    if (!blog) return res.status(404).json({ message: 'Blog not found' })

    const name = normalizeText(req.body.name)
    const email = normalizeText(req.body.email).toLowerCase()
    const phone = normalizeText(req.body.phone)
    const message = normalizeText(req.body.message)

    if (!name) return res.status(400).json({ message: 'Name is required.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Valid email is required.' })
    if (!message) return res.status(400).json({ message: 'Comment message is required.' })

    const comment = await BlogComment.create({ blog: blog._id, name, email, phone, message })
    res.status(201).json({ message: 'Comment submitted', comment: serializeComment(comment) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to submit comment' })
  }
})

module.exports = router
