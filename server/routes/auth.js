const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

const signToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
}

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
    const normalizedUsername = username?.trim()

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

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

    if (!token) return res.status(401).json({ message: 'No token' })

    const verified = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(verified.id).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({ user })
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const normalizedUsername = username?.trim()

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    const user = await User.findOne({ username: normalizedUsername })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' })

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
