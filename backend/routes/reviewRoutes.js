const express = require('express');
const router = express.Router();
const {
  getCourseReviews,
  getAllReviews,
  addReview,
  updateReview,
  deleteReview,
  approveReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Public routes
router.get('/course/:courseId', getCourseReviews);

// Protected routes
router.post('/', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.get('/', protect, authorize('admin'), getAllReviews);
router.put('/:id/approve', protect, authorize('admin'), approveReview);

module.exports = router;
