const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getInstructorProfile,
  banUser,
  unbanUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, isAdmin } = require('../middleware/rbacMiddleware');

// Public route - get instructor profile
router.get('/instructor/:id', getInstructorProfile);

// Admin only routes
router.get('/stats', protect, isAdmin, getUserStats);

// All protected routes require authentication
router.use(protect);

// Admin only routes
router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(authorize('admin', 'instructor', 'student'), getUserById)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

// Admin only - ban/unban routes
router.put('/:id/ban', authorize('admin'), banUser);
router.put('/:id/unban', authorize('admin'), unbanUser);

module.exports = router;
