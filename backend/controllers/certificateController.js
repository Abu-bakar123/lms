const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Generate certificate for completed course
// @route   POST /api/enrollments/:id/certificate
// @access  Private
const generateCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('student', 'name email');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns the enrollment
    if (enrollment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if course is completed
    if (enrollment.progress < 100 || enrollment.status !== 'completed') {
      return res.status(400).json({ message: 'Course must be 100% completed to generate certificate' });
    }

    // Generate unique certificate ID
    const certificateId = `CERT-${enrollment._id.toString().slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    
    // Create certificate data
    const certificateData = {
      certificateId,
      studentName: enrollment.student.name,
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor?.name || 'Instructor',
      completionDate: enrollment.completedAt,
      issueDate: new Date(),
      courseDuration: enrollment.course.totalDuration,
      grade: 'Passed'
    };

    // Save certificate to enrollment
    enrollment.certificate = certificateId;
    await enrollment.save();

    res.json({
      message: 'Certificate generated successfully',
      certificate: certificateData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificate details
// @route   GET /api/enrollments/:id/certificate
// @access  Private
const getCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('student', 'name email');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns the enrollment or is admin
    if (enrollment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!enrollment.certificate) {
      return res.status(404).json({ message: 'Certificate not found. Complete the course to get a certificate.' });
    }

    res.json({
      certificateId: enrollment.certificate,
      studentName: enrollment.student.name,
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor?.name || 'Instructor',
      completionDate: enrollment.completedAt,
      courseDuration: enrollment.course.totalDuration,
      grade: 'Passed'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ certificate: req.params.certificateId })
      .populate('course')
      .populate('student', 'name');

    if (!enrollment) {
      return res.status(404).json({ 
        valid: false,
        message: 'Certificate not found' 
      });
    }

    // Get instructor details
    const course = await Course.findById(enrollment.course._id).populate('instructor', 'name');

    res.json({
      valid: true,
      certificate: {
        certificateId: enrollment.certificate,
        studentName: enrollment.student.name,
        courseName: enrollment.course.title,
        completionDate: enrollment.completedAt,
        issueDate: enrollment.updatedAt,
        instructorName: course.instructor?.name || 'Instructor'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateCertificate,
  getCertificate,
  verifyCertificate
};
