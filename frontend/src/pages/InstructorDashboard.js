import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, enrollmentsAPI } from '../services/api';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, DollarSign, TrendingUp, Plus, 
  Edit, Trash2, Eye, EyeOff, Play, Clock, GraduationCap
} from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all enrollments.')) return;
    
    try {
      await coursesAPI.delete(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (course, e) => {
    e.preventDefault();
    try {
      await coursesAPI.update(course._id, { 
        isPublished: !course.isPublished 
      });
      setCourses(courses.map(c => 
        c._id === course._id ? { ...c, isPublished: !c.isPublished } : c
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update course');
    }
  };

  // Calculate stats
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const draftCourses = courses.filter(c => !c.isPublished).length;
  const totalRevenue = totalStudents * 49.99; // Simulated revenue at $49.99 per course

  // Generate chart data
  const courseEnrollmentData = courses.map(c => ({
    name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
    students: c.enrollmentCount || 0,
    published: c.isPublished
  }));

  // Simulated monthly revenue data
  const monthlyRevenueData = [];
  let runningRevenue = 0;
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const monthlyAdd = Math.floor(Math.random() * 2000) + 500;
    runningRevenue += monthlyAdd;
    monthlyRevenueData.push({
      month,
      revenue: monthlyAdd,
      cumulative: runningRevenue
    });
  }

  // Simulated student progress data
  const progressData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const week = `Week ${7 - i}`;
    progressData.push({
      week,
      completionRate: Math.floor(Math.random() * 30) + 50,
      avgProgress: Math.floor(Math.random() * 20) + 60
    });
  }

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
          <p className="mt-3 text-light">Loading dashboard...</p>
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
          className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3"
        >
          <div>
            <h1 className="text-white fw-bold">Instructor Dashboard</h1>
            <p className="text-light opacity-75">Welcome back, {user.name}! Here's your teaching overview.</p>
          </div>
          <button onClick={() => navigate('/courses/create')} className="btn btn-primary d-flex align-items-center gap-2">
            <Plus size={20} />
            Create New Course
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="d-flex gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'courses', label: 'My Courses' },
              { id: 'analytics', label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn px-4 py-2 rounded-pill fw-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'btn-primary' 
                    : 'btn-outline-light'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-6 col-lg-3">
                <motion.div variants={itemVariants}>
                  <div className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="text-light opacity-75 mb-1">Total Courses</p>
                          <h2 className="text-white fw-bold mb-0">{courses.length}</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                          <BookOpen size={24} className="text-primary" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-light opacity-75">{publishedCourses} published</small>
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
                          <p className="text-light opacity-75 mb-1">Total Students</p>
                          <h2 className="text-white fw-bold mb-0">{totalStudents}</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                          <Users size={24} className="text-success" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-success">Across all courses</small>
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
                          <p className="text-light opacity-75 mb-1">Est. Revenue</p>
                          <h2 className="text-white fw-bold mb-0">${totalRevenue.toLocaleString()}</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                          <DollarSign size={24} className="text-warning" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-warning">Simulated at $49.99/course</small>
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
                          <h2 className="text-white fw-bold mb-0">72%</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
                          <TrendingUp size={24} className="text-pink-400" style={{ color: '#ec4899' }} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-light opacity-75">Student completion</small>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="row g-4 mb-4">
              {/* Course Enrollments Bar Chart */}
              <div className="col-lg-6">
                <motion.div variants={itemVariants} className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <div className="card-body">
                    <h5 className="text-white fw-bold mb-4">Course Enrollments</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={courseEnrollmentData.length > 0 ? courseEnrollmentData : generateMockCourseData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Revenue Area Chart */}
              <div className="col-lg-6">
                <motion.div variants={itemVariants} className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <div className="card-body">
                    <h5 className="text-white fw-bold mb-4">Revenue Overview (Monthly)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyRevenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="month" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)' }}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)' }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10b981" 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                          name="Monthly Revenue"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Student Progress Chart */}
            <motion.div variants={itemVariants} className="card border-0" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <div className="card-body">
                <h5 className="text-white fw-bold mb-4">Student Progress Trends</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="week" 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => [`${value}%`]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                      name="Completion Rate"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgProgress" 
                      stroke="#ec4899" 
                      strokeWidth={3}
                      dot={{ fill: '#ec4899', strokeWidth: 2 }}
                      name="Avg. Progress"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
          >
            {courses.length > 0 ? (
              <div className="row g-4">
                {courses.map(course => (
                  <div key={course._id} className="col-md-6 col-lg-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card border-0 h-100" 
                      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${course.isPublished ? 'bg-success' : 'bg-secondary'}`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span className={`badge ${
                            course.level === 'beginner' ? 'bg-success' : 
                            course.level === 'intermediate' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {course.level}
                          </span>
                        </div>
                        <h5 className="text-white fw-bold mb-2">{course.title}</h5>
                        <p className="text-light opacity-75 small mb-3">{course.category}</p>
                        
                        <div className="d-flex gap-3 mb-3">
                          <div className="d-flex align-items-center gap-1">
                            <Users size={16} className="text-primary" />
                            <small className="text-light">{course.enrollmentCount || 0} students</small>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Clock size={16} className="text-warning" />
                            <small className="text-light">{course.modules?.length || 0} modules</small>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/courses/${course._id}`} 
                            className="btn btn-sm btn-outline-light flex-grow-1"
                          >
                            View
                          </Link>
                          <Link 
                            to={`/courses/${course._id}/edit`} 
                            className="btn btn-sm btn-outline-primary"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            className={`btn btn-sm ${course.isPublished ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={(e) => handleTogglePublish(course, e)}
                          >
                            {course.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(course._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-5"
              >
                <div className="card border-0 py-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <BookOpen size={64} className="text-light opacity-50 mx-auto mb-4" />
                  <h4 className="text-white mb-2">No courses yet</h4>
                  <p className="text-light opacity-75 mb-4">Start creating your first course to share your knowledge.</p>
                  <button onClick={() => navigate('/courses/create')} className="btn btn-primary">
                    <Plus size={20} className="me-2" />
                    Create Your First Course
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="card border-0" 
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
          >
            <div className="card-body">
              <h4 className="text-white fw-bold mb-4">Detailed Analytics</h4>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="text-light opacity-75 mb-3">Top Performing Courses</h6>
                  <div className="table-responsive">
                    <table className="table table-dark border-0" style={{ background: 'transparent' }}>
                      <thead>
                        <tr>
                          <th className="bg-transparent text-light opacity-75">Course</th>
                          <th className="bg-transparent text-light opacity-75">Students</th>
                          <th className="bg-transparent text-light opacity-75">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(courseEnrollmentData.length > 0 ? courseEnrollmentData : generateMockCourseData())
                          .sort((a, b) => b.students - a.students)
                          .slice(0, 5)
                          .map((course, index) => (
                            <tr key={index}>
                              <td className="text-white">{course.name}</td>
                              <td className="text-light">{course.students}</td>
                              <td className="text-success">${(course.students * 49.99).toLocaleString()}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <h6 className="text-light opacity-75 mb-3">Course Categories</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {[...new Set(courses.map(c => c.category))].map((category, index) => (
                      <span key={index} className="badge bg-primary-subtle text-primary px-3 py-2">
                        {category} ({courses.filter(c => c.category === category).length})
                      </span>
                    ))}
                    {courses.length === 0 && (
                      <>
                        <span className="badge bg-primary-subtle text-primary px-3 py-2">Web Development (3)</span>
                        <span className="badge bg-success-subtle text-success px-3 py-2">Data Science (2)</span>
                        <span className="badge bg-warning-subtle text-warning px-3 py-2">Mobile Apps (1)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Generate mock data for demo
function generateMockCourseData() {
  return [
    { name: 'React Mastery', students: 45, published: true },
    { name: 'Node.js Basics', students: 32, published: true },
    { name: 'Python for Data', students: 28, published: true },
    { name: 'Vue.js Complete', students: 18, published: false },
    { name: 'TypeScript Guide', students: 12, published: true }
  ];
}

export default InstructorDashboard;
