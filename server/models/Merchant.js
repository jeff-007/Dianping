const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: String,
  business_hours: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  avg_rating: {
    type: Number,
    default: 0
  },
  price_range: {
    type: Number,
    min: 1,
    max: 4
  },
  images: [String],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audit_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  license_image: String,
  identity_card_image: String,
  rejection_reason: String,
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

merchantSchema.index({ location: '2dsphere' });
merchantSchema.index({ category: 1 });
merchantSchema.index({ avg_rating: -1 });

module.exports = mongoose.model('Merchant', merchantSchema);
