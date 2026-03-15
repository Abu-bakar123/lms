import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setSocialLoading('google');
      // Initialize Google OAuth
      const googleWindow = window.open(
        'https://accounts.google.com/o/oauth2/v2/auth?' +
        `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}&` +
        `redirect_uri=${window.location.origin}/auth/google/callback&` +
        'response_type=code&' +
        'scope=email profile',
        'width=500',
        'height=600'
      );
      
      // For demo purposes, simulate Google login
      toast.info('Google OAuth demo - Use email/password or GitHub');
      setSocialLoading(null);
    } catch (err) {
      toast.error('Google login failed');
      setSocialLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setSocialLoading('github');
      // Initialize GitHub OAuth
      const githubWindow = window.open(
        'https://github.com/login/oauth/authorize?' +
        `client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID || ''}&` +
        `redirect_uri=${window.location.origin}/auth/github/callback&` +
        'scope=user:email',
        'width=500',
        'height=600'
      );
      
      // For demo purposes, simulate GitHub login
      toast.info('GitHub OAuth demo - Use email/password or Google');
      setSocialLoading(null);
    } catch (err) {
      toast.error('GitHub login failed');
      setSocialLoading(null);
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
                  <h2 className="fw-bold mb-1" style={{ color: '#002147' }}>Welcome Back</h2>
                  <p className="text-muted">Sign in to continue your learning journey</p>
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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="remember" />
                      <label className="form-check-label text-muted small" htmlFor="remember">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="small text-decoration-none" style={{ color: '#002147' }}>
                      Forgot password?
                    </Link>
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
                        Signing in...
                      </span>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ms-2" size={20} />
                      </>
                    )}
                  </motion.button>
                </form>
                
                {/* Social Login */}
                <div className="mb-4">
                  <div className="position-relative">
                    <div className="position-absolute top-50 start-50 translate-middle w-100" style={{ zIndex: 1 }}>
                      <span className="bg-white px-3 text-muted small">or continue with</span>
                    </div>
                    <hr className="mt-4" />
                  </div>
                  
                  <div className="d-flex gap-3 mt-4">
                    <motion.button
                      type="button"
                      className="btn btn-lg flex-fill d-flex align-items-center justify-content-center gap-2"
                      onClick={handleGoogleLogin}
                      disabled={socialLoading === 'google'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb',
                        background: 'white',
                        color: '#374151',
                        fontWeight: '500'
                      }}
                    >
                      {socialLoading === 'google' ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      Google
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn-lg flex-fill d-flex align-items-center justify-content-center gap-2"
                      onClick={handleGithubLogin}
                      disabled={socialLoading === 'github'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb',
                        background: 'white',
                        color: '#374151',
                        fontWeight: '500'
                      }}
                    >
                      {socialLoading === 'github' ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                      GitHub
                    </motion.button>
                  </div>
                </div>
                
                <p className="text-center mb-0" style={{ color: '#6b7280' }}>
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="fw-semibold text-decoration-none"
                    style={{ color: '#002147' }}
                  >
                    Create Account
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

export default Login;
