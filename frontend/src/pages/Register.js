import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await register(name, email, password, role);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

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
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ 
        background: 'linear-gradient(135deg, #002147 0%, #1a365d 50%, #002147 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div className="position-absolute inset-0 opacity-10">
        <div className="position-absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="position-absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container position-relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="row justify-content-center"
        >
          <motion.div variants={itemVariants} className="col-md-6 col-lg-5">
            <div 
              className="card border-0 shadow-lg"
              style={{ 
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ 
                      width: '70px', 
                      height: '70px',
                      background: 'linear-gradient(135deg, #002147 0%, #1a365d 100%)'
                    }}
                  >
                    <span className="text-white fw-bold" style={{ fontSize: '28px' }}>L</span>
                  </motion.div>
                  <h2 className="fw-bold mb-1" style={{ color: '#002147' }}>Create Account</h2>
                  <p className="text-muted">Start your learning journey today</p>
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-danger border-0"
                    style={{ 
                      borderRadius: '10px',
                      background: '#fee2e2',
                      color: '#dc2626'
                    }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-medium mb-2" style={{ color: '#374151' }}>
                      Full Name
                    </label>
                    <div className="position-relative">
                      <div 
                        className="position-absolute top-50 start-0 translate-middle-y d-flex align-items-center ps-3"
                        style={{ color: '#6b7280' }}
                      >
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-lg ps-5"
                        id="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ 
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          background: '#f9fafb'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium mb-2" style={{ color: '#374151' }}>
                      Email Address
                    </label>
                    <div className="position-relative">
                      <div 
                        className="position-absolute top-50 start-0 translate-middle-y d-flex align-items-center ps-3"
                        style={{ color: '#6b7280' }}
                      >
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        className="form-control form-control-lg ps-5"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ 
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          background: '#f9fafb'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium mb-2" style={{ color: '#374151' }}>
                      Password
                    </label>
                    <div className="position-relative">
                      <div 
                        className="position-absolute top-50 start-0 translate-middle-y d-flex align-items-center ps-3"
                        style={{ color: '#6b7280' }}
                      >
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg ps-5 pe-5"
                        id="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ 
                          borderRadius: '10px',
                          border: '2px solid #e5e7eb',
                          background: '#f9fafb'
                        }}
                      />
                      <button
                        type="button"
                        className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-decoration-none pe-3"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ color: '#6b7280' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-medium mb-3" style={{ color: '#374151' }}>
                      I want to
                    </label>
                    <div className="row g-3">
                      <div className="col-6">
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`card border-2 cursor-pointer h-100 ${
                            role === 'student' ? 'border-primary' : 'border-light'
                          }`}
                          style={{ 
                            borderRadius: '12px',
                            border: role === 'student' ? '2px solid #002147' : '2px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div className="card-body text-center p-3">
                            <div 
                              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                              style={{ 
                                width: '50px', 
                                height: '50px',
                                background: role === 'student' ? '#002147' : '#f3f4f6'
                              }}
                            >
                              <GraduationCap 
                                size={24} 
                                style={{ color: role === 'student' ? 'white' : '#6b7280' }} 
                              />
                            </div>
                            <h6 className="mb-1" style={{ color: role === 'student' ? '#002147' : '#374151' }}>
                              Learn
                            </h6>
                            <p className="small text-muted mb-0">As a Student</p>
                            <input
                              type="radio"
                              name="role"
                              value="student"
                              checked={role === 'student'}
                              onChange={(e) => setRole(e.target.value)}
                              className="position-absolute opacity-0"
                              style={{ top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                          </div>
                        </motion.label>
                      </div>
                      <div className="col-6">
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="card border-2 cursor-pointer h-100"
                          style={{ 
                            borderRadius: '12px',
                            border: role === 'instructor' ? '2px solid #002147' : '2px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div className="card-body text-center p-3">
                            <div 
                              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                              style={{ 
                                width: '50px', 
                                height: '50px',
                                background: role === 'instructor' ? '#002147' : '#f3f4f6'
                              }}
                            >
                              <BookOpen 
                                size={24} 
                                style={{ color: role === 'instructor' ? 'white' : '#6b7280' }} 
                              />
                            </div>
                            <h6 className="mb-1" style={{ color: role === 'instructor' ? '#002147' : '#374151' }}>
                              Teach
                            </h6>
                            <p className="small text-muted mb-0">As an Instructor</p>
                            <input
                              type="radio"
                              name="role"
                              value="instructor"
                              checked={role === 'instructor'}
                              onChange={(e) => setRole(e.target.value)}
                              className="position-absolute opacity-0"
                              style={{ top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                          </div>
                        </motion.label>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="btn btn-lg w-100 mb-4"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #002147 0%, #1a365d 100%)',
                      color: 'white',
                      fontWeight: '600',
                      padding: '14px'
                    }}
                  >
                    {loading ? (
                      <span className="d-flex align-items-center justify-content-center">
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ms-2" size={20} />
                      </>
                    )}
                  </motion.button>
                </form>
                
                <p className="text-center mb-0" style={{ color: '#6b7280' }}>
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="fw-semibold text-decoration-none"
                    style={{ color: '#002147' }}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
