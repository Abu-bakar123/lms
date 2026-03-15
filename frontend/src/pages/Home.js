import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, ArrowRight, Star, Clock, Play } from 'lucide-react';
import { coursesAPI } from '../services/api';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 6 });
      setCourses(response.data.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Expert Instructors',
      description: 'Learn from industry experts with years of real-world experience.',
      color: 'bg-blue-500'
    },
    {
      icon: Award,
      title: 'Comprehensive Content',
      description: 'Access thousands of courses covering various topics and skills.',
      color: 'bg-amber-500'
    },
    {
      icon: Users,
      title: 'Career Advancement',
      description: 'Gain skills that help you advance in your career with certificates.',
      color: 'bg-green-500'
    }
  ];

  const stats = [
    { value: '500+', label: 'Courses Available' },
    { value: '100+', label: 'Expert Instructors' },
    { value: '10,000+', label: 'Active Students' },
    { value: '50,000+', label: 'Certificates Issued' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer at Google',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      quote: 'This platform changed my career. I went from a complete beginner to a full-stack developer in just 6 months!'
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist at Amazon',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      quote: 'The courses are world-class. The instructors explain complex concepts in a way that is easy to understand.'
    },
    {
      name: 'Emily Davis',
      role: 'UX Designer at Apple',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      quote: 'I love the flexibility of learning at my own pace. The certificates helped me land my dream job!'
    }
  ];

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 min-h-[600px] flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-2 mb-4 text-sm font-medium bg-white/10 text-white rounded-full backdrop-blur-sm">
                  🎓 Welcome to Modern Learning
                </span>
                <h1 className="display-3 fw-bold text-white mb-4">
                  Unlock Your Potential with{' '}
                  <span className="text-accent">Expert-Led Courses</span>
                </h1>
                <p className="lead text-white-80 mb-4" style={{ opacity: 0.9 }}>
                  Learn from industry experts and advance your career with our comprehensive 
                  online courses. Join thousands of students transforming their futures.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/courses" 
                      className="btn btn-light btn-lg px-5 fw-semibold shadow-lg"
                    >
                      Browse Courses
                      <ArrowRight className="ms-2" size={20} />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/register" 
                      className="btn btn-outline-light btn-lg px-5 fw-semibold"
                      style={{ borderWidth: '2px' }}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="position-relative"
              >
                <div className="glass-card p-4 rounded-3 shadow-premium" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Students learning" 
                    className="img-fluid rounded-3 shadow-lg"
                    style={{ animation: 'float 6s ease-in-out infinite' }}
                  />
                  {/* Floating Stats Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="position-absolute bg-white rounded-3 p-3 shadow-lg"
                    style={{ bottom: '-20px', left: '-20px' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-success rounded-circle p-2">
                        <Award className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="mb-0 fw-bold text-dark">10,000+</p>
                        <p className="mb-0 text-muted small">Certified Students</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5" style={{ background: '#F8FAFC' }}>
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="row text-center"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="col-6 col-md-3"
              >
                <div className="p-4">
                  <h2 className="display-4 fw-bold text-primary mb-1">{stat.value}</h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 py-lg-7">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold text-dark mb-3">Why Choose Our Platform?</h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
              We provide the best learning experience with cutting-edge technology 
              and expert guidance.
            </p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="row g-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="col-md-4"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="card h-100 border-0 shadow-card overflow-hidden"
                  style={{ borderRadius: '16px' }}
                >
                  <div className="card-body p-5 text-center">
                    <div 
                      className={`${feature.color} d-inline-flex align-items-center justify-content-center rounded-circle mb-4`}
                      style={{ width: '80px', height: '80px' }}
                    >
                      <feature.icon className="text-white" size={36} />
                    </div>
                    <h4 className="fw-bold mb-3">{feature.title}</h4>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-5 py-lg-7" style={{ background: '#F8FAFC' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3"
          >
            <div>
              <h2 className="display-5 fw-bold text-dark mb-2">Featured Courses</h2>
              <p className="text-muted mb-0">Start your learning journey today</p>
            </div>
            <Link 
              to="/courses" 
              className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-4"
              style={{ borderRadius: '8px' }}
            >
              View All Courses
              <ArrowRight size={18} />
            </Link>
          </motion.div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="row g-4"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  variants={itemVariants}
                  className="col-md-6 col-lg-4"
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-5">
              <div className="py-5">
                <BookOpen size={64} className="text-muted mb-4" />
                <p className="text-muted fs-5">No courses available yet.</p>
                <Link to="/courses" className="btn btn-primary mt-2">
                  Browse All Courses
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5 py-lg-7">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold text-dark mb-3">Explore Categories</h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
              Choose from a wide range of categories to start learning
            </p>
          </motion.div>
          
          <div className="row g-4">
            {[
              { name: 'Web Development', icon: '💻', count: '120+ Courses' },
              { name: 'Data Science', icon: '📊', count: '80+ Courses' },
              { name: 'Mobile Development', icon: '📱', count: '60+ Courses' },
              { name: 'Cloud Computing', icon: '☁️', count: '50+ Courses' },
              { name: 'Artificial Intelligence', icon: '🤖', count: '70+ Courses' },
              { name: 'UI/UX Design', icon: '🎨', count: '45+ Courses' }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="col-md-6 col-lg-4"
              >
                <Link to={`/courses?category=${category.name}`} className="text-decoration-none">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <span className="display-4 me-3">{category.icon}</span>
                        <div>
                          <h5 className="fw-bold text-dark mb-1">{category.name}</h5>
                          <p className="text-muted mb-0 small">{category.count}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5 py-lg-7" style={{ background: '#F8FAFC' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold text-dark mb-3">What Our Students Say</h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
              Join thousands of satisfied learners who transformed their careers
            </p>
          </motion.div>
          
          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="col-md-4"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  className="card h-100 border-0 shadow-sm"
                  style={{ borderRadius: '16px' }}
                >
                  <div className="card-body p-4">
                    <div className="mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="text-warning" fill="#ffc107" />
                      ))}
                    </div>
                    <p className="mb-4" style={{ fontStyle: 'italic' }}>"{testimonial.quote}"</p>
                    <div className="d-flex align-items-center">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="rounded-circle me-3"
                        width="50"
                        height="50"
                      />
                      <div>
                        <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 py-lg-7 position-relative overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 position-absolute inset-0"></div>
        <div className="position-absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container position-relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="display-4 fw-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="lead text-white-90 mb-5 mx-auto" style={{ maxWidth: '600px', opacity: 0.9 }}>
              Join thousands of students already learning on our platform. 
              Get access to world-class courses and expert instructors.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/register" 
                  className="btn btn-light btn-lg px-5 fw-semibold shadow-lg"
                  style={{ borderRadius: '8px' }}
                >
                  Sign Up Now
                  <ArrowRight className="ms-2" size={20} />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/courses" 
                  className="btn btn-outline-light btn-lg px-5 fw-semibold"
                  style={{ borderRadius: '8px', borderWidth: '2px' }}
                >
                  <Play className="me-2" size={18} />
                  Watch Demo
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
