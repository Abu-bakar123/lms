const mongoose = require('mongoose');

// Completed lesson schema for nested tracking
const completedLessonSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // New nested progress tracking
  completedLessons: [completedLessonSchema],
  // Legacy support for flat lessons (array of lesson IDs)
  completedLessonsLegacy: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId
  },
  currentModule: {
    type: mongoose.Schema.Types.ObjectId
  },
  currentModuleIndex: {
    type: Number,
    default: 0
  },
  currentLessonIndex: {
    type: Number,
    default: 0
  },
  // Heartbeat tracking - stores current time position for each lesson
  // Using nested format: { moduleId: { lessonId: { currentTime, lastWatched } } }
  lessonProgress: {
    type: Map,
    of: {
      currentTime: Number,
      lastWatched: Date
    },
    default: {}
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  certificate: {
    type: String,
    default: null
  },
  notes: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    moduleId: mongoose.Schema.Types.ObjectId,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure a student can only enroll once in a course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Method to check if a lesson is completed
enrollmentSchema.methods.isLessonCompleted = function(lessonId) {
  return this.completedLessons.some(
    cl => cl.lessonId.toString() === lessonId.toString()
  );
};

// Method to get completed lessons count
enrollmentSchema.methods.getCompletedLessonsCount = function() {
  return this.completedLessons.length;
};

// Method to update progress with module/lesson tracking
enrollmentSchema.methods.updateProgress = async function(lessonId, moduleId) {
  // Check if already completed
  const alreadyCompleted = this.completedLessons.some(
    cl => cl.lessonId.toString() === lessonId.toString()
  );

  if (!alreadyCompleted) {
    this.completedLessons.push({
      moduleId,
      lessonId,
      completedAt: Date.now()
    });
    this.lastAccessedAt = Date.now();
    
    // Calculate progress percentage using nested modules
    const course = await mongoose.model('Course').findById(this.course);
    if (course && course.modules && course.modules.length > 0) {
      // Count total lessons from modules
      const totalLessons = course.modules.reduce((acc, module) => {
        return acc + (module.lessons ? module.lessons.length : 0);
      }, 0);
      
      if (totalLessons > 0) {
        this.progress = Math.round((this.completedLessons.length / totalLessons) * 100);
        
        if (this.progress === 100) {
          this.status = 'completed';
          this.completedAt = Date.now();
        }
      }
    } else if (course && course.lessons && course.lessons.length > 0) {
      // Backward compatibility for flat lessons
      this.progress = Math.round((this.completedLessons.length / course.lessons.length) * 100);
      
      if (this.progress === 100) {
        this.status = 'completed';
        this.completedAt = Date.now();
      }
    }
  }
  
  return this.save();
};

// Method to mark lesson as incomplete
enrollmentSchema.methods.uncompleteLesson = function(lessonId) {
  this.completedLessons = this.completedLessons.filter(
    cl => cl.lessonId.toString() !== lessonId.toString()
  );
  return this.save();
};

// Method to get next lesson in the course
enrollmentSchema.methods.getNextLesson = async function() {
  const course = await mongoose.model('Course').findById(this.course);
  if (!course || !course.modules || course.modules.length === 0) {
    return null;
  }

  // Find current position
  let currentModuleIndex = this.currentModuleIndex || 0;
  let currentLessonIndex = this.currentLessonIndex || 0;

  // Try next lesson in current module
  if (course.modules[currentModuleIndex]) {
    const currentModule = course.modules[currentModuleIndex];
    if (currentModule.lessons && currentLessonIndex < currentModule.lessons.length - 1) {
      return {
        moduleId: currentModule._id,
        lesson: currentModule.lessons[currentLessonIndex + 1],
        moduleIndex: currentModuleIndex,
        lessonIndex: currentLessonIndex + 1
      };
    }
  }

  // Try next module
  if (currentModuleIndex < course.modules.length - 1) {
    const nextModule = course.modules[currentModuleIndex + 1];
    if (nextModule.lessons && nextModule.lessons.length > 0) {
      return {
        moduleId: nextModule._id,
        lesson: nextModule.lessons[0],
        moduleIndex: currentModuleIndex + 1,
        lessonIndex: 0
      };
    }
  }

  return null;
};

// Virtual for total completed lessons
enrollmentSchema.virtual('completedCount').get(function() {
  return this.completedLessons.length;
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
