const mongoose = require('mongoose');

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  videoUrl: String,
  videoType: {
    type: String,
    enum: ['youtube', 'vimeo', 'upload', 'external', 'linkedin'],
    default: 'external'
  },
  duration: {
    type: Number,
    default: 0
  }, // in minutes
  content: String,
  resourceUrl: String,
  order: Number,
  isFree: {
    type: Boolean,
    default: false
  }
}, { _id: true });

// Module Schema
const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  order: Number,
  lessons: [lessonSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  previewVideo: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // New nested modules structure
  modules: [moduleSchema],
  // Keep old flat lessons for backward compatibility during migration
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  price: {
    type: Number,
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  // Computed fields
  totalModules: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0 // in minutes
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  requirements: [{
    type: String
  }],
  objectives: [{
    type: String
  }],
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Calculate total modules, lessons and duration before saving
courseSchema.pre('save', function(next) {
  // If modules exist, calculate from modules
  if (this.modules && this.modules.length > 0) {
    this.totalModules = this.modules.length;
    this.totalLessons = this.modules.reduce((acc, module) => {
      return acc + (module.lessons ? module.lessons.length : 0);
    }, 0);
    this.totalDuration = this.modules.reduce((acc, module) => {
      if (module.lessons) {
        return acc + module.lessons.reduce((lessonAcc, lesson) => {
          return lessonAcc + (lesson.duration || 0);
        }, 0);
      }
      return acc;
    }, 0);
  } else if (this.lessons && this.lessons.length > 0) {
    // Backward compatibility: treat flat lessons as a single default module
    this.totalModules = 1;
    this.totalLessons = this.lessons.length;
    // Note: duration calculation for flat lessons would need separate handling
  } else {
    this.totalModules = 0;
    this.totalLessons = 0;
    this.totalDuration = 0;
  }
  next();
});

// Method to get all lessons as flat array (for backward compatibility)
courseSchema.methods.getAllLessons = function() {
  if (this.modules && this.modules.length > 0) {
    return this.modules.flatMap(module => module.lessons || []);
  }
  return this.lessons || [];
};

// Method to find lesson by ID across all modules
courseSchema.methods.findLesson = function(lessonId) {
  if (this.modules && this.modules.length > 0) {
    for (const module of this.modules) {
      if (module.lessons) {
        const lesson = module.lessons.find(l => l._id.toString() === lessonId.toString());
        if (lesson) {
          return { lesson, moduleId: module._id };
        }
      }
    }
  }
  return null;
};

// Index for text search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for performance
courseSchema.index({ instructor: 1, category: 1 });
courseSchema.index({ isPublished: 1, createdAt: -1 });

// Static method to calculate average rating
courseSchema.statics.calcAverageRating = async function(courseId) {
  const Review = require('./Review');
  const stats = await Review.aggregate([
    {
      $match: { course: courseId, isApproved: true }
    },
    {
      $group: {
        _id: '$course',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(courseId, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].nRating
    });
  } else {
    await this.findByIdAndUpdate(courseId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

module.exports = mongoose.model('Course', courseSchema);
