const router = require('express').Router()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')
const { sendMail, smtpEnabled } = require('../utils/mailer')

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
  address: user.address
})

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

const buildPasswordResetEmail = ({ resetLink, username }) => {
  const safeUsername = escapeHtml(username || 'Admin')
  const safeResetLink = escapeHtml(resetLink)

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
      <body style="margin:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fb;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 18px;border-bottom:1px solid #eef2f7;">
                    <div style="font-size:14px;font-weight:700;color:#76c83b;text-transform:uppercase;letter-spacing:.06em;">Admin Security</div>
                    <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#111827;">Reset your password</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello ${safeUsername},</p>
                    <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">We received a request to reset the password for your Junayed Khan admin account. Use the button below within 30 minutes.</p>
                    <p style="margin:0 0 24px;">
                      <a href="${safeResetLink}" style="display:inline-block;background:#76c83b;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:13px 22px;">Reset password</a>
                    </p>
                    <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#6b7280;">If the button does not work, copy this link into your browser:</p>
                    <p style="margin:0 0 22px;font-size:13px;line-height:1.6;word-break:break-all;color:#2563eb;">${safeResetLink}</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">If you did not request this, you can safely ignore this email.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.5;">
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
        <body style="margin:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fb;padding:32px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:28px 32px;">
                      <div style="font-size:14px;font-weight:700;color:#76c83b;text-transform:uppercase;letter-spacing:.06em;">Account Verification</div>
                      <h1 style="margin:10px 0 12px;font-size:25px;line-height:1.25;color:#111827;">Confirm your email</h1>
                      <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Hello ${safeUsername}, use this code to unlock password options in your admin account.</p>
                      <div style="font-size:32px;letter-spacing:8px;font-weight:800;color:#111827;background:#f3f4f6;border-radius:10px;padding:16px 20px;text-align:center;">${safeCode}</div>
                      <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#6b7280;">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
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
    const normalizedUsername = normalizeUsername(username)
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' })
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const adminExists = await User.exists({})
    if (adminExists) {
      return res.status(403).json({ message: 'Admin already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword
    })

    await user.save()
    res.status(201).json({ message: 'Admin created', user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ message: 'Unable to create admin' })
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
    if (!smtpEnabled()) return res.status(503).json({ message: 'Email service is not configured' })

    const code = crypto.randomInt(100000, 999999).toString()
    user.accountVerificationCode = crypto.createHash('sha256').update(code).digest('hex')
    user.accountVerificationExpires = new Date(Date.now() + 1000 * 60 * 10)
    await user.save()

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

    res.json({ message: 'Verification code sent to your email.' })
  } catch (err) {
    console.error('Unable to send account verification code:', err.message)
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

    res.json({ message: 'Email verified. Password options are unlocked.' })
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

    res.json({ message: 'Password updated successfully.' })
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

    if (!smtpEnabled() && process.env.RETURN_RESET_LINK !== 'true') {
      return res.status(503).json({ message: 'Email service is not configured' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30)
    await user.save()

    const frontendUrl = getResetBaseUrl(req)
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`

    if (smtpEnabled()) {
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
    }

    res.json({
      message: successMessage,
      resetLink: !smtpEnabled() && process.env.RETURN_RESET_LINK === 'true' ? resetLink : undefined
    })
  } catch (err) {
    console.error('Unable to send password reset email:', err.message)
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
