const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
  try {
    let token

    // 1. Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // 2. No token = unauthorized
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please login first.' })
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 4. Check user still exists in database
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' })
    }

    req.user = { id: user._id, role: user.role, name: user.name, email: user.email }
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' })
  }
}

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' })
  }
}
