const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get reviews for a course
// @route   GET /api/reviews/course/:courseId
// @access  Public
const getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      course: req.params.courseId,
      isApproved: true 
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, course, approved } = req.query;
    
    let query = {};
    if (course) query.course = course;
    if (approved !== undefined) query.isApproved = approved === 'true';

    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalReviews: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to course
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { courseId, rating, title, comment } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(400).json({ message: 'You must be enrolled to review this course' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user.id,
      course: courseId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }

    const review = await Review.create({
      course: courseId,
      user: req.user.id,
      rating,
      title,
      comment
    });

    await review.populate('user', 'name avatar');

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment !== undefined ? comment : review.comment;

    await review.save();

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Unapprove review (admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
const approveReview = async (req, res) => {
  try {
    const { approved } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = approved;
    await review.save();

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourseReviews,
  getAllReviews,
  addReview,
  updateReview,
  deleteReview,
  approveReview
};
