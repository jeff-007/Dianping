const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [
        { email: email || 'null_email_placeholder' }, 
        { phone: phone || 'null_phone_placeholder' }
      ] 
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email || undefined, // Set to undefined if empty string to avoid unique constraint error with sparse index
      phone,
      password_hash: hashedPassword,
      role: role || 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Check for user email or phone
    const user = await User.findOne({
      $or: [
        { email: email || 'null_email_placeholder' },
        { phone: phone || 'null_phone_placeholder' }
      ]
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  register,
  login,
  getMe,
};
