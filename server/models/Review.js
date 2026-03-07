const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: String,
  images: [String]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index to prevent duplicate reviews by same user for same merchant
reviewSchema.index({ user: 1, merchant: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
