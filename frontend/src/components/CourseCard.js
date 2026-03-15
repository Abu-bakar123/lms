import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, BookOpen, ArrowRight } from 'lucide-react';

const CourseCard = ({ course }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -8 }}
        className="card h-100 border-0 shadow-card overflow-hidden"
        style={{ 
          borderRadius: '16px',
          background: 'white',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Thumbnail */}
        <div className="position-relative overflow-hidden" style={{ height: '180px' }}>
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              className="card-img-top" 
              alt={course.title}
              style={{ 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center bg-light"
              style={{ height: '100%' }}
            >
              <BookOpen size={48} className="text-muted" />
            </div>
          )}
          {/* Overlay on hover */}
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ 
              background: 'rgba(0,33,71,0.7)',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <Link 
              to={`/courses/${course._id}`}
              className="btn btn-light"
            >
              View Details
              <ArrowRight className="ms-2" size={16} />
            </Link>
          </div>
          {/* Category Badge */}
          <span 
            className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill fw-medium"
            style={{ 
              background: 'rgba(255,255,255,0.95)',
              color: '#002147',
              fontSize: '12px'
            }}
          >
            {course.category}
          </span>
        </div>

        <div className="card-body d-flex flex-column p-4">
          {/* Title */}
          <h5 
            className="fw-bold mb-2"
            style={{ 
              color: '#1a1a1a',
              fontSize: '18px',
              lineHeight: '1.4'
            }}
          >
            {course.title}
          </h5>
          
          {/* Description */}
          <p 
            className="text-muted small mb-3 flex-grow-1"
            style={{ 
              lineHeight: '1.6',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {course.description}
          </p>
          
          {/* Instructor */}
          <div className="d-flex align-items-center mb-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ 
                width: '32px', 
                height: '32px',
                background: '#002147',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {course.instructor?.name?.charAt(0) || 'I'}
            </div>
            <span className="text-muted small">{course.instructor?.name}</span>
          </div>
          
          {/* Meta Info */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span 
              className={`badge px-2 py-1 rounded ${
                course.level === 'beginner' 
                  ? 'bg-success-subtle text-success' 
                  : course.level === 'intermediate' 
                    ? 'bg-warning-subtle text-warning' 
                    : 'bg-danger-subtle text-danger'
              }`}
              style={{ fontSize: '11px' }}
            >
              {course.level}
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-3 text-muted small mb-3">
            <div className="d-flex align-items-center">
              <BookOpen size={14} className="me-1" />
              <span>{course.totalLessons || 0} lessons</span>
            </div>
            <div className="d-flex align-items-center">
              <Clock size={14} className="me-1" />
              <span>{course.totalDuration || 0} min</span>
            </div>
            <div className="d-flex align-items-center">
              <Users size={14} className="me-1" />
              <span>{course.enrollmentCount || 0}</span>
            </div>
          </div>
          
          {/* Price & CTA */}
          <div className="d-flex justify-content-between align-items-center pt-3 border-top">
            <div>
              {course.isFree || course.price === 0 ? (
                <span 
                  className="fw-bold"
                  style={{ color: '#22c55e', fontSize: '18px' }}
                >
                  Free
                </span>
              ) : (
                <span 
                  className="fw-bold"
                  style={{ color: '#002147', fontSize: '18px' }}
                >
                  ${course.price}
                </span>
              )}
            </div>
            <Link 
              to={`/courses/${course._id}`}
              className="btn btn-sm px-3 py-2"
              style={{ 
                background: '#002147',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              View Course
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseCard;
