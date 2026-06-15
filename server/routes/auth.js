const router = require('express').Router()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')
const { sendMail, emailEnabled } = require('../utils/mailer')
const { loadServerCss } = require('../utils/cssLoader')

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const normalizeUsername = (username) => username?.trim().toLowerCase()
const normalizeEmail = (email) => email?.trim().toLowerCase()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  age: user.age,
  address: user.address,
  accountVerifiedUntil: user.accountVerifiedUntil || null
})

const validateAdminCredentials = ({ username, email, password }) => {
  const normalizedUsername = normalizeUsername(username)
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedUsername || !normalizedEmail || !password) {
    return { error: 'Username, email, and password are required' }
  }

  if (!emailPattern.test(normalizedEmail)) {
    return { error: 'Enter a valid email address' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  return { username: normalizedUsername, email: normalizedEmail }
}

const ensureUniqueAdminIdentity = async ({ username, email }) => {
  const existingUsername = await User.findOne({ username })
  if (existingUsername) return 'Name is already in use'

  const existingEmail = await User.findOne({ email })
  if (existingEmail) return 'Email is already in use'

  return ''
}

const getResetBaseUrl = (req) => {
  const origin = req.get('origin')?.replace(/\/$/, '')
  const isLocalOrigin = origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)

  if (isLocalOrigin) return origin

  const configuredUrl = process.env.CLIENT_URL
    ?.split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .find(Boolean)

  if (configuredUrl) return configuredUrl

  if (origin) return origin

  return `${req.protocol}://${req.get('host')}`
}

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const logEmailError = (label, err) => {
  console.error(label, {
    message: err.message,
    code: err.code,
    command: err.command,
    responseCode: err.responseCode
  })
}

const buildPasswordResetEmail = ({ resetLink, username }) => {
  const safeUsername = escapeHtml(username || 'Admin')
  const safeResetLink = escapeHtml(resetLink)
  const emailCss = loadServerCss('email.css')

  const text = [
    'Password reset requested for your Junayed Khan admin account.',
    '',
    `Hello ${username || 'Admin'},`,
    '',
    'Use the secure link below to create a new password. This link expires in 30 minutes.',
    resetLink,
    '',
    'If you did not request this, you can ignore this email. Your current password will stay unchanged.',
    '',
    'Junayed Khan Admin'
  ].join('\n')

  const html = `
    <!doctype html>
    <html>
      <head>
        <style>${emailCss}</style>
      </head>
      <body class="email_body">
        <table class="email_shell" role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <table class="email_card" role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="email_header">
                    <div class="email_kicker">Admin Security</div>
                    <h1 class="email_title">Reset your password</h1>
                  </td>
                </tr>
                <tr>
                  <td class="email_body_cell">
                    <p class="email_text">Hello ${safeUsername},</p>
                    <p class="email_text email_text_spaced">We received a request to reset the password for your Junayed Khan admin account. Use the button below within 30 minutes.</p>
                    <p class="email_button_wrap">
                      <a class="email_button" href="${safeResetLink}">Reset password</a>
                    </p>
                    <p class="email_muted">If the button does not work, copy this link into your browser:</p>
                    <p class="email_link_text">${safeResetLink}</p>
                    <p class="email_note">If you did not request this, you can safely ignore this email.</p>
                  </td>
                </tr>
                <tr>
                  <td class="email_footer">
                    Junayed Khan Admin<br />
                    This is an account security email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return { text, html }
}

const buildAccountVerificationEmail = ({ code, username }) => {
  const safeUsername = escapeHtml(username || 'Admin')
  const safeCode = escapeHtml(code)
  const emailCss = loadServerCss('email.css')

  return {
    text: [
      `Hello ${username || 'Admin'},`,
      '',
      'Use this verification code to unlock password options in your admin account.',
      '',
      code,
      '',
      'This code expires in 10 minutes.',
      '',
      'Junayed Khan Admin'
    ].join('\n'),
    html: `
      <!doctype html>
      <html>
        <head>
          <style>${emailCss}</style>
        </head>
        <body class="email_body">
          <table class="email_shell" role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table class="email_card email_card_narrow" role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="email_body_cell">
                      <div class="email_kicker">Account Verification</div>
                      <h1 class="email_title email_title_compact">Confirm your email</h1>
                      <p class="email_text">Hello ${safeUsername}, use this code to unlock password options in your admin account.</p>
                      <div class="email_code">${safeCode}</div>
                      <p class="email_note email_code_note">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }
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
    const { username, email, password } = req.body
    const validated = validateAdminCredentials({ username, email, password })

    if (validated.error) return res.status(400).json({ message: validated.error })

    const adminExists = await User.exists({})
    if (adminExists) {
      return res.status(403).json({ message: 'Admin already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username: validated.username,
      email: validated.email,
      password: hashedPassword
    })

    await user.save()
    res.status(201).json({ message: 'Admin created', user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to create admin' })
  }
})

router.get('/admins', authMiddleware, async (req, res) => {
  try {
    const admins = await User.find({}).select('-password').sort({ username: 1 })
    res.json({ admins: admins.map(publicUser) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to load admins' })
  }
})

router.post('/admins', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findOne({
      _id: req.user.id,
      accountVerifiedUntil: { $gt: new Date() }
    })

    if (!currentUser) {
      return res.status(403).json({ message: 'Verify your email before adding another admin' })
    }

    const { username, email, password } = req.body
    const validated = validateAdminCredentials({ username, email, password })

    if (validated.error) return res.status(400).json({ message: validated.error })

    const identityError = await ensureUniqueAdminIdentity(validated)
    if (identityError) return res.status(409).json({ message: identityError })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      username: validated.username,
      email: validated.email,
      password: hashedPassword
    })

    await user.save()

    const admins = await User.find({}).select('-password').sort({ username: 1 })
    res.status(201).json({
      message: 'Admin added successfully.',
      user: publicUser(user),
      admins: admins.map(publicUser)
    })
  } catch (err) {
    res.status(500).json({ message: 'Unable to add admin' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({ user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to verify session' })
  }
})

router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username)
    const email = normalizeEmail(req.body.email)
    const address = req.body.address?.trim()
    const age = req.body.age === '' || req.body.age === undefined || req.body.age === null
      ? undefined
      : Number(req.body.age)

    if (!username) {
      return res.status(400).json({ message: 'Name is required' })
    }

    if (!email || !emailPattern.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }

    if (age !== undefined && (!Number.isInteger(age) || age < 0)) {
      return res.status(400).json({ message: 'Enter a valid age' })
    }

    const currentUser = await User.findById(req.user.id)
    if (!currentUser) return res.status(404).json({ message: 'User not found' })

    const existingUsername = await User.findOne({
      username,
      _id: { $ne: req.user.id }
    })

    if (existingUsername) {
      return res.status(409).json({ message: 'Name is already in use' })
    }

    const existingEmail = await User.findOne({
      email,
      _id: { $ne: req.user.id }
    })

    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already in use' })
    }

    const emailChanged = currentUser.email !== email

    if (emailChanged && (!currentUser.accountVerifiedUntil || currentUser.accountVerifiedUntil <= new Date())) {
      return res.status(403).json({ message: 'Verify your email before changing the email address' })
    }

    currentUser.username = username
    currentUser.email = email
    currentUser.age = age
    currentUser.address = address
    if (emailChanged) currentUser.accountVerifiedUntil = undefined
    await currentUser.save()

    res.json({ message: 'Account information updated', user: publicUser(currentUser) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update account information' })
  }
})

router.post('/me/send-verification-code', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) return res.status(404).json({ message: 'User not found' })
    if (!user.email) return res.status(400).json({ message: 'Save a recovery email first' })
    if (!emailEnabled()) return res.status(503).json({ message: 'Email service is not configured' })

    const code = crypto.randomInt(100000, 999999).toString()
    const emailContent = buildAccountVerificationEmail({
      code,
      username: user.username
    })

    await sendMail({
      to: user.email,
      subject: 'Verify your Junayed Khan admin account',
      text: emailContent.text,
      html: emailContent.html
    })

    user.accountVerificationCode = crypto.createHash('sha256').update(code).digest('hex')
    user.accountVerificationExpires = new Date(Date.now() + 1000 * 60 * 10)
    await user.save()

    res.json({ message: 'Verification code sent to your email.' })
  } catch (err) {
    logEmailError('Unable to send account verification code:', err)
    res.status(500).json({ message: 'Unable to send verification code' })
  }
})

router.post('/me/verify-code', authMiddleware, async (req, res) => {
  try {
    const code = String(req.body.code || '').trim()

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Enter the 6 digit verification code' })
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex')
    const user = await User.findOne({
      _id: req.user.id,
      accountVerificationCode: hashedCode,
      accountVerificationExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Verification code is invalid or expired' })
    }

    user.accountVerificationCode = undefined
    user.accountVerificationExpires = undefined
    user.accountVerifiedUntil = new Date(Date.now() + 1000 * 60 * 10)
    await user.save()

    res.json({ message: 'Email verified. Password options are unlocked.', user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to verify code' })
  }
})

router.patch('/me/password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const user = await User.findOne({
      _id: req.user.id,
      accountVerifiedUntil: { $gt: new Date() }
    })

    if (!user) {
      return res.status(403).json({ message: 'Verify your email before setting a new password' })
    }

    user.password = await bcrypt.hash(password, 10)
    user.accountVerifiedUntil = undefined
    await user.save()

    res.json({ message: 'Password updated successfully.', user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to update password' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const identifier = normalizeUsername(username)

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email or username and password are required' })
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    })
    if (!user) return res.status(401).json({ message: 'Invalid username or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' })

    const token = signToken(user._id)
    res.json({
      token,
      user: publicUser(user)
    })
  } catch (err) {
    res.status(500).json({ message: 'Unable to login' })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)

    if (!email || !emailPattern.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }

    const user = await User.findOne({ email })

    const successMessage = 'If that email is connected to the admin account, a password reset link has been sent.'

    if (!user) {
      return res.json({ message: successMessage })
    }

    if (!emailEnabled()) {
      return res.status(503).json({ message: 'Email service is not configured' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const frontendUrl = getResetBaseUrl(req)
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`

    const emailContent = buildPasswordResetEmail({
      resetLink,
      username: user.username
    })

    await sendMail({
      to: user.email,
      subject: 'Reset your Junayed Khan admin password',
      text: emailContent.text,
      html: emailContent.html
    })

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30)
    await user.save()

    res.json({ message: successMessage })
  } catch (err) {
    logEmailError('Unable to send password reset email:', err)
    res.status(500).json({ message: 'Unable to send reset link' })
  }
})

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or expired' })
    }

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successful. You can login now.' })
  } catch (err) {
    res.status(500).json({ message: 'Unable to reset password' })
  }
})

module.exports = router
