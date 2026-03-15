const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  getEnrollmentWithCourse,
  updateProgress,
  unenrollCourse,
  getAllEnrollments,
  getEnrollmentStats,
  getCourseEnrollments,
  getEnrollmentAnalytics
} = require('../controllers/enrollmentController');
const { generateCertificate, getCertificate, verifyCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, isInstructorOrAdmin } = require('../middleware/rbacMiddleware');

// All routes require authentication
router.use(protect);

// Public for authenticated users
router.post('/', enrollCourse);
router.get('/my-courses', getMyEnrollments);
router.put('/:id/progress', updateProgress);
router.delete('/:id', unenrollCourse);

// More specific routes must come before /:id
router.get('/stats', authorize('admin'), getEnrollmentStats);
router.get('/analytics', authorize('admin'), getEnrollmentAnalytics);
router.get('/course/:courseId', authorize('admin', 'instructor'), getCourseEnrollments);
router.get('/:id/with-course', getEnrollmentWithCourse);
router.get('/:id', getEnrollment);

// Instructor/Admin routes
router.get('/', authorize('admin', 'instructor'), getAllEnrollments);

// Certificate routes
router.post('/:id/certificate', generateCertificate);
router.get('/:id/certificate', getCertificate);

// Public certificate verification
router.get('/certificate/verify/:certificateId', verifyCertificate);

module.exports = router;
