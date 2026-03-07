const express = require('express');
const router = express.Router();
const { getMerchants, getMerchant, createMerchant } = require('../controllers/merchantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getMerchants);
router.get('/:id', getMerchant);
router.post('/', protect, authorize('merchant', 'admin'), createMerchant);

module.exports = router;
