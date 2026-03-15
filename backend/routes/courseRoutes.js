const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  updateModule,
  deleteModule,
  reorderModules,
  addLesson,
  updateLesson,
  removeLesson,
  reorderLessons,
  addLessonLegacy,
  removeLessonLegacy,
  getMyCourses,
  getCourseStats,
  getCategories,
  migrateToModules
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, isInstructorOrAdmin } = require('../middleware/rbacMiddleware');

// Public routes
router.get('/categories', getCategories);
router.get('/my-courses', protect, getMyCourses);
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected routes - Instructor or Admin
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, isInstructorOrAdmin, updateCourse);
router.delete('/:id', protect, isInstructorOrAdmin, deleteCourse);

// Module management routes
router.post('/:id/modules', protect, isInstructorOrAdmin, addModule);
router.put('/:id/modules/:moduleId', protect, isInstructorOrAdmin, updateModule);
router.delete('/:id/modules/:moduleId', protect, isInstructorOrAdmin, deleteModule);
router.put('/:id/modules/reorder', protect, isInstructorOrAdmin, reorderModules);

// Lesson management within modules
router.post('/:id/modules/:moduleId/lessons', protect, isInstructorOrAdmin, addLesson);
router.put('/:id/modules/:moduleId/lessons/:lessonId', protect, isInstructorOrAdmin, updateLesson);
router.delete('/:id/modules/:moduleId/lessons/:lessonId', protect, isInstructorOrAdmin, removeLesson);
router.put('/:id/modules/:moduleId/lessons/reorder', protect, isInstructorOrAdmin, reorderLessons);

// Legacy lesson routes (backward compatibility)
router.post('/:id/lessons', protect, isInstructorOrAdmin, addLessonLegacy);
router.delete('/:id/lessons/:lessonId', protect, isInstructorOrAdmin, removeLessonLegacy);

// Migration route
router.post('/:id/migrate', protect, isInstructorOrAdmin, migrateToModules);

// Stats
router.get('/:id/stats', protect, isInstructorOrAdmin, getCourseStats);

module.exports = router;
