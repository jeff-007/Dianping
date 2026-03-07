const Merchant = require('../models/Merchant');

// @desc    Get all merchants with filtering
// @route   GET /api/merchants
// @access  Public
const getMerchants = async (req, res) => {
  const { keyword, category, lat, lng, radius, min_rating, max_price, owner } = req.query;

  let query = { audit_status: 'approved' };

  // Allow filtering by owner (for dashboard)
  if (owner) {
    query.owner = owner;
    delete query.audit_status; // Allow owner to see pending/rejected
  }

  // Keyword search
  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Rating filter
  if (min_rating) {
    query.avg_rating = { $gte: Number(min_rating) };
  }

  // Price filter
  if (max_price) {
    query.price_range = { $lte: Number(max_price) };
  }

  // Location filter (GeoJSON)
  if (lat && lng) {
    const r = radius ? Number(radius) : 5000; // Default 5km
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)]
        },
        $maxDistance: r
      }
    };
  }

  try {
    const merchants = await Merchant.find(query).populate('category', 'name icon');
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single merchant
// @route   GET /api/merchants/:id
// @access  Public
const getMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('owner', 'name avatar_url');

    if (merchant) {
      res.json(merchant);
    } else {
      res.status(404).json({ message: 'Merchant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new merchant
// @route   POST /api/merchants
// @access  Private (Merchant/Admin)
const createMerchant = async (req, res) => {
  const { 
    name, address, phone, category, 
    latitude, longitude, price_range, 
    business_hours, images, license_image, identity_card_image 
  } = req.body;

  try {
    const merchant = new Merchant({
      name,
      address,
      phone,
      category,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      },
      price_range,
      business_hours,
      images,
      license_image,
      identity_card_image,
      owner: req.user.id,
      audit_status: 'pending'
    });

    const createdMerchant = await merchant.save();
    res.status(201).json(createdMerchant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMerchants, getMerchant, createMerchant };
