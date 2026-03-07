const Review = require('../models/Review');
const Merchant = require('../models/Merchant');

// @desc    Get reviews for a merchant
// @route   GET /api/reviews/:merchantId
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ merchant: req.params.merchantId })
      .populate('user', 'name avatar_url')
      .sort({ created_at: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { merchantId, rating, content, images } = req.body;

  try {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      merchant: merchantId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this merchant' });
    }

    const review = await Review.create({
      user: req.user.id,
      merchant: merchantId,
      rating,
      content,
      images
    });

    // Update average rating
    // In a real app, use aggregation pipeline or atomic update. For simplicity:
    const reviews = await Review.find({ merchant: merchantId });
    merchant.avg_rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await merchant.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReviews, createReview };
