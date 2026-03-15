const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to validate ObjectId (24 character hex string)
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && 
         typeof id === 'string' && 
         id.length === 24 && 
         /^[0-9a-fA-F]{24}$/.test(id);
};

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private/Student
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Get first lesson and module for initial position
    let currentModuleId = null;
    let currentLessonId = null;
    let currentModuleIndex = 0;
    let currentLessonIndex = 0;

    if (course.modules && course.modules.length > 0) {
      const firstModule = course.modules[0];
      currentModuleId = firstModule._id;
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        currentLessonId = firstModule.lessons[0]._id;
      }
    } else if (course.lessons && course.lessons.length > 0) {
      // Backward compatibility for flat lessons
      currentLessonId = course.lessons[0]._id;
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      currentModule: currentModuleId,
      currentLesson: currentLessonId,
      currentModuleIndex,
      currentLessonIndex
    });

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: courseId }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's enrollments
// @route   GET /api/enrollments/my-courses
// @access  Private
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .sort({ lastAccessedAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
const getEnrollment = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid enrollment ID format' });
    }

    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns the enrollment or is admin
    if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get enrollment with full course content (including modules and lessons)
// @route   GET /api/enrollments/:id/with-course
// @access  Private
const getEnrollmentWithCourse = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid enrollment ID format' });
    }

    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: 'course',
        populate: [
          {
            path: 'instructor',
            select: 'name avatar'
          }
        ]
      });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns the enrollment or is admin
    if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get the full course with modules and lessons
    const course = await Course.findById(enrollment.course._id);
    
    // Return enrollment with full course details
    const response = {
      ...enrollment.toObject(),
      course: {
        ...course.toObject(),
        instructor: enrollment.course.instructor
      }
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid enrollment ID format' });
    }

    const { lessonId, moduleId, completed, currentTime } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns the enrollment
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get the course to find module/lesson info
    const course = await Course.findById(enrollment.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Handle heartbeat (currentTime update without marking complete)
    if (currentTime !== undefined && lessonId) {
      enrollment.currentLesson = lessonId;
      if (moduleId) {
        enrollment.currentModule = moduleId;
      }
      enrollment.lastAccessedAt = Date.now();
      
      // Store current time for resume functionality
      if (!enrollment.lessonProgress) {
        enrollment.lessonProgress = {};
      }
      enrollment.lessonProgress[lessonId] = {
        currentTime: currentTime,
        lastWatched: Date.now()
      };
      
      await enrollment.save();
      return res.json(enrollment);
    }

    // Find the module ID if not provided
    let actualModuleId = moduleId;
    if (!actualModuleId && lessonId) {
      // Search through modules to find the lesson
      if (course.modules && course.modules.length > 0) {
        for (const module of course.modules) {
          const lesson = module.lessons.find(l => l._id.toString() === lessonId);
          if (lesson) {
            actualModuleId = module._id;
            break;
          }
        }
      }
    }

    // Find current position in course
    if (actualModuleId) {
      const moduleIndex = course.modules.findIndex(
        m => m._id.toString() === actualModuleId.toString()
      );
      if (moduleIndex !== -1) {
        enrollment.currentModuleIndex = moduleIndex;
      }
    }

    if (lessonId) {
      const lessonIndex = course.modules
        .find(m => m._id.toString() === actualModuleId?.toString())
        ?.lessons.findIndex(l => l._id.toString() === lessonId);
      
      if (lessonIndex !== undefined && lessonIndex !== -1) {
        enrollment.currentLessonIndex = lessonIndex;
      }
    }

    if (completed && lessonId) {
      // Check if already completed
      const alreadyCompleted = enrollment.completedLessons.some(
        cl => cl.lessonId.toString() === lessonId
      );

      if (!alreadyCompleted) {
        enrollment.completedLessons.push({
          moduleId: actualModuleId,
          lessonId,
          completedAt: Date.now()
        });
      }
    } else if (!completed && lessonId) {
      // Remove from completed lessons
      enrollment.completedLessons = enrollment.completedLessons.filter(
        cl => cl.lessonId.toString() !== lessonId
      );
    }

    // Update current lesson and module
    if (lessonId) {
      enrollment.currentLesson = lessonId;
    }
    if (actualModuleId) {
      enrollment.currentModule = actualModuleId;
    }
    enrollment.lastAccessedAt = Date.now();

    // Calculate progress percentage using nested modules
    let totalLessons = 0;
    if (course.modules && course.modules.length > 0) {
      totalLessons = course.modules.reduce((acc, module) => {
        return acc + (module.lessons ? module.lessons.length : 0);
      }, 0);
    } else if (course.lessons && course.lessons.length > 0) {
      // Backward compatibility
      totalLessons = course.lessons.length;
    }

    if (totalLessons > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedLessons.length / totalLessons) * 100
      );

      if (enrollment.progress === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = Date.now();
      } else if (enrollment.progress > 0) {
        enrollment.status = 'active';
      }
    }

    await enrollment.save();

    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark lesson as complete
// @route   POST /api/enrollments/:id/complete-lesson
// @access  Private
const completeLesson = async (req, res) => {
  try {
    const { lessonId, moduleId } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns the enrollment
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find the module ID if not provided
    let actualModuleId = moduleId;
    const course = await Course.findById(enrollment.course);
    
    if (!actualModuleId && lessonId && course.modules) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l._id.toString() === lessonId);
        if (lesson) {
          actualModuleId = module._id;
          break;
        }
      }
    }

    // Check if already completed
    const alreadyCompleted = enrollment.completedLessons.some(
      cl => cl.lessonId.toString() === lessonId
    );

    if (alreadyCompleted) {
      return res.json({ message: 'Lesson already completed', enrollment });
    }

    // Add to completed lessons
    enrollment.completedLessons.push({
      moduleId: actualModuleId,
      lessonId,
      completedAt: Date.now()
    });

    // Update current positions
    enrollment.currentLesson = lessonId;
    if (actualModuleId) {
      enrollment.currentModule = actualModuleId;
      
      // Find module index
      if (course.modules) {
        const moduleIndex = course.modules.findIndex(
          m => m._id.toString() === actualModuleId.toString()
        );
        if (moduleIndex !== -1) {
          enrollment.currentModuleIndex = moduleIndex;
          
          // Find lesson index
          const lessonIndex = course.modules[moduleIndex].lessons.findIndex(
            l => l._id.toString() === lessonId
          );
          if (lessonIndex !== -1) {
            enrollment.currentLessonIndex = lessonIndex;
          }
        }
      }
    }

    enrollment.lastAccessedAt = Date.now();

    // Calculate progress
    let totalLessons = 0;
    if (course.modules && course.modules.length > 0) {
      totalLessons = course.modules.reduce((acc, module) => {
        return acc + (module.lessons ? module.lessons.length : 0);
      }, 0);
    } else if (course.lessons) {
      totalLessons = course.lessons.length;
    }

    if (totalLessons > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedLessons.length / totalLessons) * 100
      );

      if (enrollment.progress === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = Date.now();
      }
    }

    await enrollment.save();

    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unenroll from course
// @route   DELETE /api/enrollments/:id
// @access  Private
const unenrollCourse = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid enrollment ID format' });
    }

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns the enrollment or is admin
    if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update course enrollment count
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { enrollmentCount: -1 }
    });

    // Remove course from user's enrolled courses
    await User.findByIdAndUpdate(enrollment.student, {
      $pull: { enrolledCourses: enrollment.course }
    });

    await enrollment.deleteOne();

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all enrollments (Admin/Instructor)
// @route   GET /api/enrollments
// @access  Private/Admin, Instructor
const getAllEnrollments = async (req, res) => {
  try {
    let query = {};

    // If instructor, only show enrollments for their courses
    if (req.user.role === 'instructor') {
      const courses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = courses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate({
        path: 'course',
        select: 'title instructor'
      })
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get enrollment analytics for charts
// @route   GET /api/enrollments/analytics
// @access  Private/Admin
const getEnrollmentAnalytics = async (req, res) => {
  try {
    // Get enrollment trends for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0
    const filledTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = enrollmentTrends.find(t => t._id === dateStr);
      filledTrends.push({
        date: dateStr,
        enrollments: found ? found.count : 0
      });
    }

    // Get cumulative enrollments for growth chart
    let cumulative = 0;
    const platformGrowth = filledTrends.map(t => {
      cumulative += t.enrollments;
      return {
        date: t.date,
        total: cumulative
      };
    });

    res.json({
      enrollmentTrends: filledTrends,
      platformGrowth
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get enrollment stats (Admin Dashboard)
// @route   GET /api/enrollments/stats
// @access  Private/Admin
const getEnrollmentStats = async (req, res) => {
  try {
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });

    // Get enrollments in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newEnrollmentsLast30Days = await Enrollment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalEnrollments,
      completedEnrollments,
      activeEnrollments,
      newEnrollmentsLast30Days
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course enrollments (Instructor)
// @route   GET /api/enrollments/course/:courseId
// @access  Private/Instructor, Admin
const getCourseEnrollments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email avatar')
      .sort({ lastAccessedAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  getEnrollmentWithCourse,
  updateProgress,
  completeLesson,
  unenrollCourse,
  getAllEnrollments,
  getEnrollmentStats,
  getCourseEnrollments,
  getEnrollmentAnalytics
};
