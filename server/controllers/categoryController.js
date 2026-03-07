const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ sort_order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories };
