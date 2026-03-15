const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .select('-lessons.modules.lessons')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCourses: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio expertise');

    if (course) {
      // Check if user is enrolled
      let enrollment = null;
      if (req.user) {
        enrollment = await Enrollment.findOne({
          student: req.user.id,
          course: course.id
        });
      }

      res.json({
        course,
        isEnrolled: !!enrollment,
        enrollment: enrollment
      });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Instructor, Admin
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      previewVideo,
      category,
      level,
      price,
      isFree,
      requirements,
      objectives,
      tags,
      modules
    } = req.body;

    const course = await Course.create({
      title,
      description,
      instructor: req.user.id,
      thumbnail,
      previewVideo,
      category,
      level,
      price,
      isFree,
      isPublished: true, // Auto-publish for testing
      requirements,
      objectives,
      tags,
      modules: modules || []
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor, Admin
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const {
      title,
      description,
      thumbnail,
      previewVideo,
      category,
      level,
      price,
      isFree,
      isPublished,
      requirements,
      objectives,
      tags,
      modules
    } = req.body;

    course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title: title || course.title,
        description: description || course.description,
        thumbnail: thumbnail || course.thumbnail,
        previewVideo: previewVideo !== undefined ? previewVideo : course.previewVideo,
        category: category || course.category,
        level: level || course.level,
        price: price !== undefined ? price : course.price,
        isFree: isFree !== undefined ? isFree : course.isFree,
        isPublished: isPublished !== undefined ? isPublished : course.isPublished,
        requirements: requirements || course.requirements,
        objectives: objectives || course.objectives,
        tags: tags || course.tags,
        modules: modules !== undefined ? modules : course.modules
      },
      { new: true, runValidators: true }
    );

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor, Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    // Delete all enrollments for this course
    await Enrollment.deleteMany({ course: course.id });

    await course.deleteOne();
    res.json({ message: 'Course removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add module to course
// @route   POST /api/courses/:id/modules
// @access  Private/Instructor, Admin
const addModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add modules to this course' });
    }

    const { title, description } = req.body;

    const module = {
      title,
      description,
      order: course.modules.length + 1,
      lessons: []
    };

    course.modules.push(module);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update module
// @route   PUT /api/courses/:id/modules/:moduleId
// @access  Private/Instructor, Admin
const updateModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this module' });
    }

    const { title, description } = req.body;

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    module.title = title || module.title;
    module.description = description !== undefined ? description : module.description;

    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete module
// @route   DELETE /api/courses/:id/modules/:moduleId
// @access  Private/Instructor, Admin
const deleteModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this module' });
    }

    course.modules = course.modules.filter(
      m => m._id.toString() !== req.params.moduleId
    );

    // Reorder remaining modules
    course.modules.forEach((module, index) => {
      module.order = index + 1;
    });

    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder modules
// @route   PUT /api/courses/:id/modules/reorder
// @access  Private/Instructor, Admin
const reorderModules = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reorder modules' });
    }

    const { moduleIds } = req.body; // Array of module IDs in new order

    if (!moduleIds || !Array.isArray(moduleIds)) {
      return res.status(400).json({ message: 'moduleIds array is required' });
    }

    // Create a map for quick lookup
    const moduleMap = new Map();
    course.modules.forEach(m => moduleMap.set(m._id.toString(), m));

    // Reorder modules based on provided order
    const reorderedModules = [];
    moduleIds.forEach((id, index) => {
      const module = moduleMap.get(id);
      if (module) {
        module.order = index + 1;
        reorderedModules.push(module);
      }
    });

    course.modules = reorderedModules;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add lesson to module
// @route   POST /api/courses/:id/modules/:moduleId/lessons
// @access  Private/Instructor, Admin
const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const { title, description, videoUrl, duration, content, resourceUrl, isFree } = req.body;

    const lesson = {
      title,
      description,
      videoUrl,
      duration: duration || 0,
      content,
      resourceUrl,
      isFree,
      order: module.lessons.length + 1
    };

    module.lessons.push(lesson);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lesson in module
// @route   PUT /api/courses/:id/modules/:moduleId/lessons/:lessonId
// @access  Private/Instructor, Admin
const updateLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const { title, description, videoUrl, duration, content, resourceUrl, isFree } = req.body;

    lesson.title = title || lesson.title;
    lesson.description = description !== undefined ? description : lesson.description;
    lesson.videoUrl = videoUrl !== undefined ? videoUrl : lesson.videoUrl;
    lesson.duration = duration !== undefined ? duration : lesson.duration;
    lesson.content = content !== undefined ? content : lesson.content;
    lesson.resourceUrl = resourceUrl !== undefined ? resourceUrl : lesson.resourceUrl;
    lesson.isFree = isFree !== undefined ? isFree : lesson.isFree;

    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete lesson from module
// @route   DELETE /api/courses/:id/modules/:moduleId/lessons/:lessonId
// @access  Private/Instructor, Admin
const removeLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to remove lessons from this course' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    module.lessons = module.lessons.filter(
      lesson => lesson._id.toString() !== req.params.lessonId
    );

    // Reorder remaining lessons
    module.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });

    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder lessons within a module
// @route   PUT /api/courses/:id/modules/:moduleId/lessons/reorder
// @access  Private/Instructor, Admin
const reorderLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reorder lessons' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const { lessonIds } = req.body;

    if (!lessonIds || !Array.isArray(lessonIds)) {
      return res.status(400).json({ message: 'lessonIds array is required' });
    }

    // Create a map for quick lookup
    const lessonMap = new Map();
    module.lessons.forEach(l => lessonMap.set(l._id.toString(), l));

    // Reorder lessons based on provided order
    const reorderedLessons = [];
    lessonIds.forEach((id, index) => {
      const lesson = lessonMap.get(id);
      if (lesson) {
        lesson.order = index + 1;
        reorderedLessons.push(lesson);
      }
    });

    module.lessons = reorderedLessons;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Legacy route for backward compatibility - Add lesson (flat)
// @route   POST /api/courses/:id/lessons
const addLessonLegacy = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
    }

    // If no modules exist, create a default module
    if (!course.modules || course.modules.length === 0) {
      course.modules.push({
        title: 'Default Module',
        description: 'Default module for legacy lessons',
        order: 1,
        lessons: []
      });
    }

    const { title, description, videoUrl, duration, content, resourceUrl, isFree } = req.body;

    const lesson = {
      title,
      description,
      videoUrl,
      duration: duration || 0,
      content,
      resourceUrl,
      isFree,
      order: course.modules[0].lessons.length + 1
    };

    course.modules[0].lessons.push(lesson);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Legacy route for backward compatibility - Remove lesson
// @route   DELETE /api/courses/:id/lessons/:lessonId
const removeLessonLegacy = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to remove lessons from this course' });
    }

    // Search through all modules for the lesson
    for (const module of course.modules) {
      const lessonIndex = module.lessons.findIndex(
        l => l._id.toString() === req.params.lessonId
      );
      if (lessonIndex !== -1) {
        module.lessons.splice(lessonIndex, 1);
        break;
      }
    }

    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/my-courses
// @access  Private/Instructor, Admin
const getMyCourses = async (req, res) => {
  try {
    const query = req.user.role === 'admin' 
      ? {} 
      : { instructor: req.user.id };

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course statistics (Admin/Instructor Dashboard)
// @route   GET /api/courses/:id/stats
// @access  Private/Instructor, Admin
const getCourseStats = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view course stats' });
    }

    const enrollments = await Enrollment.find({ course: req.params.id });
    const totalStudents = enrollments.length;
    const completedStudents = enrollments.filter(e => e.status === 'completed').length;
    const inProgressStudents = enrollments.filter(e => e.status === 'active').length;

    // Calculate average progress
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0;

    res.json({
      totalStudents,
      completedStudents,
      inProgressStudents,
      avgProgress,
      enrollmentCount: course.enrollmentCount,
      totalModules: course.totalModules,
      totalLessons: course.totalLessons,
      totalDuration: course.totalDuration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get categories
// @route   GET /api/courses/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Migrate flat lessons to modules (one-time migration)
// @route   POST /api/courses/:id/migrate
// @access  Private/Instructor, Admin
const migrateToModules = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to migrate this course' });
    }

    // If already has modules, skip
    if (course.modules && course.modules.length > 0) {
      return res.status(400).json({ message: 'Course already has modules' });
    }

    // If no flat lessons, nothing to migrate
    if (!course.lessons || course.lessons.length === 0) {
      return res.status(400).json({ message: 'No lessons to migrate' });
    }

    // Create a default module with all lessons
    course.modules = [{
      title: 'Course Content',
      description: 'Main course content',
      order: 1,
      lessons: course.lessons.map((lesson, index) => ({
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        content: lesson.content,
        order: index + 1,
        isFree: lesson.isFree
      }))
    }];

    // Clear flat lessons
    course.lessons = [];

    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
