const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined to not conflict if using phone
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar_url: String,
  role: {
    type: String,
    enum: ['user', 'merchant', 'admin'],
    default: 'user'
  },
  supabase_id: String, // For migration reference
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('User', userSchema);
