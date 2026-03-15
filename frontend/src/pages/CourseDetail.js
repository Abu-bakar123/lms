import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, enrollmentsAPI, reviewsAPI } from '../services/api';
import { 
  Play, Clock, Users, Star, Award, BookOpen, CheckCircle, 
  ChevronDown, ChevronUp, Lock, Globe, Video, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourse();
    fetchReviews();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getById(id);
      setCourse(response.data.course);
      setEnrollment(response.data.enrollment);
      
      // Expand first module by default
      if (response.data.course.modules && response.data.course.modules.length > 0) {
        const expanded = {};
        response.data.course.modules.forEach((_, index) => {
          expanded[index] = index === 0;
        });
        setExpandedModules(expanded);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getCourseReviews(id);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if course is paid
    if (!course.isFree && course.price > 0) {
      // For now, show a message about paid courses
      toast.info('Payment integration coming soon! This is a demo. Enrolling for free.');
    }

    setEnrolling(true);
    try {
      await enrollmentsAPI.enroll(id);
      toast.success('Successfully enrolled!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (index) => {
    setExpandedModules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /vimeo\.com\/(\d+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary mt-3">Browse Courses</Link>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const youtubeId = course.previewVideo ? getVideoId(course.previewVideo) : null;

  return (
    <div className="course-detail-page">
      {/* Hero Section */}
      <div className="course-hero" style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '60px 0',
        color: 'white'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Breadcrumb */}
              <nav className="mb-3" style={{ fontSize: '14px', opacity: 0.8 }}>
                <Link to="/courses" className="text-white text-decoration-none">Courses</Link>
                <span className="mx-2">/</span>
                <span>{course.category}</span>
              </nav>

              <h1 className="display-5 fw-bold mb-3">{course.title}</h1>
              <p className="lead mb-4" style={{ opacity: 0.9 }}>{course.description}</p>

              <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <Star className="text-warning me-1" size={18} fill="currentColor" />
                  <span className="fw-bold">{course.rating?.average || 0}</span>
                  <span className="ms-1" style={{ opacity: 0.8 }}>({course.rating?.count || 0} reviews)</span>
                </div>
                <div className="d-flex align-items-center">
                  <Users className="me-1" size={18} />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
                <div className="d-flex align-items-center">
                  <Clock className="me-1" size={18} />
                  <span>{course.totalDuration || 0} min</span>
                </div>
                <span className={`badge ${course.level === 'beginner' ? 'bg-success' : course.level === 'intermediate' ? 'bg-warning' : 'bg-danger'}`}>
                  {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                </span>
              </div>

              {/* Instructor Info */}
              <div className="d-flex align-items-center mt-4">
                <div className="me-3">
                  {course.instructor?.avatar ? (
                    <img 
                      src={course.instructor.avatar} 
                      alt={course.instructor.name} 
                      className="rounded-circle"
                      width="50" 
                      height="50" 
                    />
                  ) : (
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)' }}
                    >
                      <span className="fw-bold">{course.instructor?.name?.charAt(0) || 'I'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-0 fw-bold">Created by {course.instructor?.name}</p>
                  <p className="mb-0" style={{ opacity: 0.7, fontSize: '14px' }}>
                    {course.instructor?.bio?.substring(0, 80)}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'curriculum' ? 'active' : ''}`}
                  onClick={() => setActiveTab('curriculum')}
                >
                  Curriculum
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({reviews.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'instructor' ? 'active' : ''}`}
                  onClick={() => setActiveTab('instructor')}
                >
                  Instructor
                </button>
              </li>
            </ul>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="course-overview">
                {/* What You'll Learn */}
                {course.objectives && course.objectives.length > 0 && (
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        <Award className="me-2 text-primary" size={20} />
                        What you'll learn
                      </h5>
                      <div className="row">
                        {course.objectives.map((obj, index) => (
                          <div key={index} className="col-md-6 mb-2">
                            <div className="d-flex">
                              <CheckCircle className="text-success me-2 flex-shrink-0" size={18} />
                              <span>{obj}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {course.requirements && course.requirements.length > 0 && (
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        <FileText className="me-2 text-primary" size={20} />
                        Requirements
                      </h5>
                      <ul className="mb-0">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="mb-2">{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      <BookOpen className="me-2 text-primary" size={20} />
                      Description
                    </h5>
                    <p style={{ whiteSpace: 'pre-line' }}>{course.description}</p>
                  </div>
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="mb-4">
                    <h6 className="mb-2">Tags:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <span key={index} className="badge bg-light text-dark">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="course-curriculum">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">
                        <BookOpen className="me-2 text-primary" size={20} />
                        Course Content
                      </h5>
                      <span className="text-muted">
                        {course.totalModules} modules • {course.totalLessons} lessons • {course.totalDuration} min
                      </span>
                    </div>

                    {course.modules && course.modules.length > 0 ? (
                      <div className="curriculum-modules">
                        {course.modules.map((module, moduleIndex) => (
                          <div key={moduleIndex} className="module-item mb-3 border rounded">
                            <div 
                              className="module-header p-3 d-flex justify-content-between align-items-center"
                              style={{ cursor: 'pointer', background: expandedModules[moduleIndex] ? '#f8f9fa' : 'white' }}
                              onClick={() => toggleModule(moduleIndex)}
                            >
                              <div>
                                <h6 className="mb-1">{module.title}</h6>
                                <small className="text-muted">
                                  {module.lessons?.length || 0} lessons
                                </small>
                              </div>
                              {expandedModules[moduleIndex] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                            
                            {expandedModules[moduleIndex] && module.lessons && (
                              <div className="module-lessons border-top">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div 
                                    key={lessonIndex} 
                                    className="lesson-item p-3 d-flex align-items-center border-bottom"
                                    style={{ background: 'white' }}
                                  >
                                    <div className="me-3">
                                      {lesson.videoUrl ? (
                                        <Video size={18} className="text-primary" />
                                      ) : (
                                        <FileText size={18} className="text-muted" />
                                      )}
                                    </div>
                                    <div className="flex-grow-1">
                                      <p className="mb-0">{lesson.title}</p>
                                      <small className="text-muted">
                                        {lesson.duration} min
                                        {lesson.isFree && <span className="badge bg-success ms-2">Free</span>}
                                      </small>
                                    </div>
                                    {isEnrolled || lesson.isFree ? (
                                      <Play size={16} className="text-muted" />
                                    ) : (
                                      <Lock size={16} className="text-muted" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-center py-4">
                        No curriculum available yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="course-reviews">
                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((review, index) => (
                      <div key={index} className="card mb-3 border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: '40px', height: '40px', background: '#e9ecef' }}
                                >
                                  <span className="fw-bold">{review.user?.name?.charAt(0) || 'U'}</span>
                                </div>
                              </div>
                              <div>
                                <p className="mb-0 fw-bold">{review.user?.name || 'Anonymous'}</p>
                                <small className="text-muted">{review.createdAt?.split('T')[0]}</small>
                              </div>
                            </div>
                            <div className="d-flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  fill={i < review.rating ? "#ffc107" : "none"}
                                  stroke="#ffc107"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mb-0">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <Star size={48} className="text-muted mb-3" />
                    <p className="text-muted">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && (
              <div className="course-instructor">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <div className="me-4">
                        {course.instructor?.avatar ? (
                          <img 
                            src={course.instructor.avatar} 
                            alt={course.instructor.name}
                            className="rounded"
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded d-flex align-items-center justify-content-center"
                            style={{ width: '120px', height: '120px', background: '#e9ecef' }}
                          >
                            <span className="display-4">{course.instructor?.name?.charAt(0) || 'I'}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h5>{course.instructor?.name}</h5>
                        <p className="text-muted mb-2">{course.instructor?.email}</p>
                        <p className="mb-0">{course.instructor?.bio || 'No bio available.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg sticky-top" style={{ top: '20px' }}>
              {/* Preview Video */}
              {youtubeId && (
                <div className="position-relative">
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Course Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {!youtubeId && course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} />
              )}

              <div className="card-body">
                <div className="text-center mb-4">
                  <h2 className="mb-1">
                    {course.isFree || course.price === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      <>${course.price}</>
                    )}
                  </h2>
                  {course.price > 0 && (
                    <small className="text-muted text-decoration-line-through">
                      ${(course.price * 1.5).toFixed(2)}
                    </small>
                  )}
                </div>

                {isEnrolled ? (
                  <>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Your Progress</span>
                        <span className="fw-bold">{enrollment?.progress || 0}%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${enrollment?.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <Link 
                      to={`/courses/${id}/learn`} 
                      className="btn btn-primary w-100 py-2 fw-bold"
                    >
                      <Play className="me-2" size={18} />
                      Continue Learning
                    </Link>
                  </>
                ) : (
                  <>
                    {isStudent && (
                      <button
                        className="btn btn-primary w-100 py-2 fw-bold mb-3"
                        onClick={handleEnroll}
                        disabled={enrolling}
                      >
                        {enrolling ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            {course.isFree || course.price === 0 ? (
                              <>
                                <Award className="me-2" size={18} />
                                Enroll Now (Free)
                              </>
                            ) : (
                              <>
                                <Lock className="me-2" size={18} />
                                Buy Now - ${course.price}
                              </>
                            )}
                          </>
                        )}
                      </button>
                    )}
                    {!user && (
                      <Link to="/login" className="btn btn-primary w-100 py-2 fw-bold mb-3">
                        <Lock className="me-2" size={18} />
                        Login to Enroll
                      </Link>
                    )}
                  </>
                )}

                <hr />

                {/* Course Features */}
                <div className="course-features">
                  <div className="d-flex align-items-center mb-3">
                    <Globe className="text-muted me-3" size={20} />
                    <div>
                      <small className="text-muted d-block">Level</small>
                      <span className="fw-bold">{course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}</span>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center mb-3">
                    <Clock className="text-muted me-3" size={20} />
                    <div>
                      <small className="text-muted d-block">Duration</small>
                      <span className="fw-bold">{course.totalDuration || 0} minutes</span>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center mb-3">
                    <Video className="text-muted me-3" size={20} />
                    <div>
                      <small className="text-muted d-block">Lessons</small>
                      <span className="fw-bold">{course.totalLessons || 0} lessons</span>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center mb-3">
                    <Users className="text-muted me-3" size={20} />
                    <div>
                      <small className="text-muted d-block">Students</small>
                      <span className="fw-bold">{course.enrollmentCount || 0} enrolled</span>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <Award className="text-muted me-3" size={20} />
                    <div>
                      <small className="text-muted d-block">Certificate</small>
                      <span className="fw-bold">Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
