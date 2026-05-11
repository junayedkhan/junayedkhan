const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// REGISTER (only 1 admin)
router.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10)

  const user = new User({
    username: req.body.username,
    password: hashedPassword
  })

  await user.save()
  res.json({ message: "Admin created" })
})

// LOGIN
router.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username })
  if (!user) return res.status(404).json("User not found")

  const isMatch = await bcrypt.compare(req.body.password, user.password)
  if (!isMatch) return res.status(400).json("Wrong password")

  const token = jwt.sign({ id: user._id }, "secretkey")
  res.json({ token })
})

module.exports = router