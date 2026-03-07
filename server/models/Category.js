const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: String,
  sort_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Category', categorySchema);
