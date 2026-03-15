import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { 
  BookOpen, Award, Clock, Play, CheckCircle, 
  TrendingUp, ChevronRight, X
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      setEnrollments(response.data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    
    try {
      await enrollmentsAPI.unenroll(enrollmentId);
      setEnrollments(enrollments.filter(e => e._id !== enrollmentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unenroll');
    }
  };

  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCourses = enrollments.filter(e => e.status === 'active').length;
  const totalProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-light">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', paddingTop: '80px' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-white fw-bold">My Learning</h1>
          <p className="text-light opacity-75">Welcome back, {user.name}! Continue your learning journey.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="row g-4 mb-5"
        >
          <div className="col-md-6 col-lg-3">
            <motion.div variants={itemVariants}>
              <div className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-light opacity-75 mb-1">Enrolled Courses</p>
                      <h2 className="text-white fw-bold mb-0">{enrollments.length}</h2>
                    </div>
                    <div className="rounded-circle p-3" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                      <BookOpen size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-3">
            <motion.div variants={itemVariants}>
              <div className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-light opacity-75 mb-1">Completed</p>
                      <h2 className="text-white fw-bold mb-0">{completedCourses}</h2>
                    </div>
                    <div className="rounded-circle p-3" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                      <Award size={24} className="text-success" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-3">
            <motion.div variants={itemVariants}>
              <div className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-light opacity-75 mb-1">In Progress</p>
                      <h2 className="text-white fw-bold mb-0">{inProgressCourses}</h2>
                    </div>
                    <div className="rounded-circle p-3" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                      <Clock size={24} className="text-warning" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-3">
            <motion.div variants={itemVariants}>
              <div className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-light opacity-75 mb-1">Avg. Progress</p>
                      <h2 className="text-white fw-bold mb-0">{totalProgress}%</h2>
                    </div>
                    <div className="rounded-circle p-3" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
                      <TrendingUp size={24} className="text-pink-400" style={{ color: '#ec4899' }} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                      <motion.div 
                        className="progress-bar"
                        style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${totalProgress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enrolled Courses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white fw-bold mb-4">My Courses</h3>
          
          {enrollments.length > 0 ? (
            <div className="row g-4">
              {enrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="col-md-6 col-lg-4"
                >
                  <motion.div 
                    className="card border-0 h-100"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ 
                      y: -5,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {/* Course Thumbnail */}
                    <div className="position-relative">
                      {enrollment.course?.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="card-img-top"
                          style={{ height: '160px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="card-img-top d-flex align-items-center justify-content-center"
                          style={{ height: '160px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                          <BookOpen size={48} className="text-white opacity-75" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="position-absolute top-0 end-0 p-2">
                        <span className={`badge ${
                          enrollment.status === 'completed' ? 'bg-success' : 'bg-primary'
                        }`}>
                          {enrollment.status === 'completed' ? (
                            <><Award size={14} className="me-1" /> Completed</>
                          ) : (
                            <><Clock size={14} className="me-1" /> In Progress</>
                          )}
                        </span>
                      </div>
                      {/* Progress Overlay */}
                      <div className="position-absolute bottom-0 start-0 end-0 p-2" 
                        style={{ 
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          borderBottomLeftRadius: '12px',
                          borderBottomRightRadius: '12px'
                        }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-white">Progress</small>
                          <small className="text-white fw-bold">{enrollment.progress}%</small>
                        </div>
                        <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.3)' }}>
                          <motion.div 
                            className="progress-bar"
                            style={{ background: '#10b981' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <h5 className="text-white fw-bold mb-2">{enrollment.course?.title}</h5>
                      <p className="text-light opacity-75 small mb-3">
                        {enrollment.course?.description?.substring(0, 80)}...
                      </p>
                      
                      <div className="d-flex gap-3 mb-3">
                        <div className="d-flex align-items-center gap-1">
                          <Play size={14} className="text-primary" />
                          <small className="text-light opacity-75">
                            {enrollment.completedLessons?.length || 0}/{enrollment.course?.lessons?.length || 0} lessons
                          </small>
                        </div>
                        {enrollment.lastAccessedAt && (
                          <div className="d-flex align-items-center gap-1">
                            <Clock size={14} className="text-warning" />
                            <small className="text-light opacity-75">
                              {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-footer bg-transparent border-0 pt-0">
                      <div className="d-flex gap-2">
                        <Link
                          to={`/courses/${enrollment.course?._id}/learn`}
                          className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        >
                          {enrollment.progress > 0 ? (
                            <>
                              <Play size={16} />
                              Continue
                            </>
                          ) : (
                            <>
                              <Play size={16} />
                              Start Learning
                            </>
                          )}
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleUnenroll(enrollment._id)}
                          title="Unenroll"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-5"
            >
              <div className="card border-0 py-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <BookOpen size={64} className="text-light opacity-50 mx-auto mb-4" />
                <h4 className="text-white mb-2">No courses yet</h4>
                <p className="text-light opacity-75 mb-4">Start your learning journey by enrolling in a course.</p>
                <Link to="/courses" className="btn btn-primary d-inline-flex align-items-center gap-2">
                  Browse Courses
                  <ChevronRight size={20} />
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Continue Learning Section - Show recently accessed */}
        {enrollments.filter(e => e.progress > 0 && e.progress < 100).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5"
          >
            <h3 className="text-white fw-bold mb-4">Continue Learning</h3>
            <div className="row g-4">
              {enrollments
                .filter(e => e.progress > 0 && e.progress < 100)
                .slice(0, 3)
                .map((enrollment) => (
                  <div key={enrollment._id} className="col-md-4">
                    <motion.div 
                      className="card border-0"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
                        backdropFilter: 'blur(10px)'
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="rounded-circle p-2" style={{ background: 'rgba(99, 102, 241, 0.3)' }}>
                            <Play size={20} className="text-white" />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="text-white mb-0">{enrollment.course?.title}</h6>
                            <small className="text-light opacity-75">{enrollment.progress}% complete</small>
                          </div>
                        </div>
                        <div className="progress mb-3" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                          <motion.div 
                            className="progress-bar"
                            style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <Link
                          to={`/courses/${enrollment.course?._id}/learn`}
                          className="btn btn-sm btn-outline-light w-100"
                        >
                          Continue
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                ))
              }
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
