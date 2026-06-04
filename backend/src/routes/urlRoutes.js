const express = require('express');
const {
  shortenUrl,
  getAllUrls,
  deleteUrl,
  updateUrl,
  getUrlInfo,
  verifyPassword,
  trackVerifiedRedirect,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { shortenValidation } = require('../validators/authValidators');

const router = express.Router();

router.post('/shorten', protect, shortenValidation, validate, shortenUrl);
router.get('/all', protect, getAllUrls);
router.delete('/:id', protect, deleteUrl);
router.put('/:id', protect, updateUrl);
router.get('/info/:shortCode', getUrlInfo);
router.post('/verify/:shortCode', verifyPassword);
router.post('/track/:shortCode', trackVerifiedRedirect);

module.exports = router;
