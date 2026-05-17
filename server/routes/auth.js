const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const normalizeUsername = (username) => username?.trim().toLowerCase()

router.get('/status', async (req, res) => {
  try {
    const hasAdmin = await User.exists({})
    res.json({ hasAdmin: Boolean(hasAdmin) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to check auth status' })
  }
})

// REGISTER (only 1 admin)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    const adminExists = await User.exists({})
    if (adminExists) {
      return res.status(403).json({ message: 'Admin already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username: normalizedUsername,
      password: hashedPassword
    })

    await user.save()
    res.status(201).json({ message: 'Admin created' })
  } catch (err) {
    res.status(500).json({ message: 'Unable to create admin' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Unable to verify session' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    const user = await User.findOne({ username: normalizedUsername })
    if (!user) return res.status(401).json({ message: 'Invalid username or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' })

    const token = signToken(user._id)
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Unable to login' })
  }
})

module.exports = router
