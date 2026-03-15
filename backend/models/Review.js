const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Calculate average rating after save
reviewSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  await Course.calcAverageRating(this.course);
});

// Calculate average rating after delete
reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  const Course = mongoose.model('Course');
  await Course.calcAverageRating(this.course);
});

module.exports = mongoose.model('Review', reviewSchema);
