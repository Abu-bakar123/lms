import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, coursesAPI, enrollmentsAPI } from '../services/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, GraduationCap, TrendingUp, DollarSign, 
  Activity, ChevronRight, Shield, Trash2, Edit, MoreVertical
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: { totalUsers: 0, totalInstructors: 0, totalStudents: 0 },
    courses: { totalCourses: 0, publishedCourses: 0 },
    enrollments: { totalEnrollments: 0, completedEnrollments: 0 }
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({ enrollmentTrends: [], platformGrowth: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, enrollRes, analyticsRes] = await Promise.all([
        usersAPI.getAll(),
        coursesAPI.getAll({}),
        enrollmentsAPI.getStats(),
        enrollmentsAPI.getAnalytics().catch(() => ({ data: { enrollmentTrends: [], platformGrowth: [] } }))
      ]);

      const allUsers = usersRes.data;
      const allCourses = coursesRes.data.courses;
      
      setUsers(allUsers);
      setCourses(allCourses);
      setAnalytics(analyticsRes.data);
      
      setStats({
        users: {
          totalUsers: allUsers.length,
          totalInstructors: allUsers.filter(u => u.role === 'instructor').length,
          totalStudents: allUsers.filter(u => u.role === 'student').length
        },
        courses: { 
          totalCourses: allCourses.length, 
          publishedCourses: allCourses.filter(c => c.isPublished).length 
        },
        enrollments: {
          totalEnrollments: enrollRes.data.totalEnrollments,
          completedEnrollments: enrollRes.data.completedEnrollments
        }
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersAPI.delete(userId);
      setUsers(users.filter(u => u._id !== userId));
      setStats(prev => ({
        ...prev,
        users: {
          ...prev.users,
          totalUsers: prev.users.totalUsers - 1
        }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await coursesAPI.delete(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // Chart data preparation
  const userDistributionData = [
    { name: 'Students', value: stats.users.totalStudents, color: '#6366f1' },
    { name: 'Instructors', value: stats.users.totalInstructors, color: '#10b981' },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const courseStatusData = [
    { name: 'Published', count: stats.courses.publishedCourses },
    { name: 'Draft', count: stats.courses.totalCourses - stats.courses.publishedCourses }
  ];

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
          className="mb-4"
        >
          <h1 className="text-white fw-bold">Admin Dashboard</h1>
          <p className="text-light opacity-75">Welcome back, {user.name}! Here's what's happening on your platform.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="d-flex gap-2 flex-wrap">
            {['overview', 'users', 'courses'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn px-4 py-2 rounded-pill fw-semibold transition-all ${
                  activeTab === tab 
                    ? 'btn-primary' 
                    : 'btn-outline-light'
                }`}
                style={{ textTransform: 'capitalize' }}
              >
                {tab}
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
                          <p className="text-light opacity-75 mb-1">Total Users</p>
                          <h2 className="text-white fw-bold mb-0">{stats.users.totalUsers}</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                          <Users size={24} className="text-primary" />
                        </div>
                      </div>
                      <div className="mt-3 d-flex align-items-center gap-2">
                        <TrendingUp size={16} className="text-success" />
                        <small className="text-success">+{stats.users.totalInstructors + stats.users.totalStudents}</small>
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
                          <p className="text-light opacity-75 mb-1">Students</p>
                          <h2 className="text-white fw-bold mb-0">{stats.users.totalStudents}</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                          <GraduationCap size={24} className="text-success" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-light opacity-75">Active learners</small>
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
                          <p className="text-light opacity-75 mb-1">Total Courses</p>
                          <h2 className="text-white fw-bold mb-0">{stats.courses.totalCourses}</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                          <BookOpen size={24} className="text-warning" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-warning">{stats.courses.publishedCourses} published</small>
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
                          <p className="text-light opacity-75 mb-1">Enrollments</p>
                          <h2 className="text-white fw-bold mb-0">{stats.enrollments.totalEnrollments}</h2>
                        </div>
                        <div className="rounded-circle p-3" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
                          <Activity size={24} className="text-pink-400" style={{ color: '#ec4899' }} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-light opacity-75">{stats.enrollments.completedEnrollments} completed</small>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="row g-4 mb-4">
              {/* Enrollment Trends Line Chart */}
              <div className="col-lg-8">
                <motion.div variants={itemVariants} className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <div className="card-body">
                    <h5 className="text-white fw-bold mb-4">Enrollment Trends (Last 30 Days)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.enrollmentTrends.length > 0 ? analytics.enrollmentTrends : generateMockData().enrollmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).getDate()}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="enrollments" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          dot={{ fill: '#6366f1', strokeWidth: 2 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* User Distribution Pie Chart */}
              <div className="col-lg-4">
                <motion.div variants={itemVariants} className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <div className="card-body">
                    <h5 className="text-white fw-bold mb-4">User Distribution</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userDistributionData.length > 0 ? userDistributionData : generateMockData().userDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {userDistributionData.length > 0 ? userDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )) : generateMockData().userDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Legend 
                          formatter={(value) => <span className="text-light">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="row g-4 mb-4">
              {/* Course Status Bar Chart */}
              <div className="col-lg-6">
                <motion.div variants={itemVariants} className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <div className="card-body">
                    <h5 className="text-white fw-bold mb-4">Course Status</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={courseStatusData.length > 0 && courseStatusData[0].count + courseStatusData[1].count > 0 ? courseStatusData : generateMockData().courseStatus}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)' }}
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
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {courseStatusData.length > 0 && courseStatusData[0].count + courseStatusData[1].count > 0 ? (
                            <>
                              <Cell fill="#10b981" />
                              <Cell fill="#6b7280" />
                            </>
                          ) : (
                            <>
                              <Cell fill="#10b981" />
                              <Cell fill="#6b7280" />
                            </>
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Platform Growth Area Chart */}
              <div className="col-lg-6">
                <motion.div variants={itemVariants} className="card border-0 h-100" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <div className="card-body">
                    <h5 className="text-white fw-bold mb-4">Platform Growth (Cumulative)</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={analytics.platformGrowth.length > 0 ? analytics.platformGrowth : generateMockData().platformGrowth}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).getDate()}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(15, 23, 42, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#8b5cf6" 
                          fillOpacity={1} 
                          fill="url(#colorTotal)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="card border-0" 
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white fw-bold">User Management</h4>
                <button onClick={() => navigate('/courses/create')} className="btn btn-primary">
                  Create Course
                </button>
              </div>
              
              {users.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-dark table-hover border-0" style={{ background: 'transparent' }}>
                    <thead>
                      <tr className="border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                        <th className="bg-transparent text-light opacity-75">Name</th>
                        <th className="bg-transparent text-light opacity-75">Email</th>
                        <th className="bg-transparent text-light opacity-75">Role</th>
                        <th className="bg-transparent text-light opacity-75">Status</th>
                        <th className="bg-transparent text-light opacity-75">Joined</th>
                        <th className="bg-transparent text-light opacity-75">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                          <td className="text-white py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.2)' }}>
                                <span className="text-primary fw-bold">{u.name?.charAt(0).toUpperCase()}</span>
                              </div>
                              {u.name}
                            </div>
                          </td>
                          <td className="text-light opacity-75 py-3">{u.email}</td>
                          <td className="py-3">
                            <span className={`badge ${
                              u.role === 'admin' ? 'bg-danger' : 
                              u.role === 'instructor' ? 'bg-warning' : 'bg-info'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`badge ${u.isBanned ? 'bg-danger' : 'bg-success'}`}>
                              {u.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="text-light opacity-75 py-3">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            {u._id !== user._id && (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteUser(u._id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-light opacity-75 text-center py-5">No users found</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="card border-0" 
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white fw-bold">Course Management</h4>
                <button onClick={() => navigate('/courses/create')} className="btn btn-primary">
                  Create Course
                </button>
              </div>
              
              {courses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-dark table-hover border-0" style={{ background: 'transparent' }}>
                    <thead>
                      <tr className="border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                        <th className="bg-transparent text-light opacity-75">Title</th>
                        <th className="bg-transparent text-light opacity-75">Instructor</th>
                        <th className="bg-transparent text-light opacity-75">Category</th>
                        <th className="bg-transparent text-light opacity-75">Level</th>
                        <th className="bg-transparent text-light opacity-75">Students</th>
                        <th className="bg-transparent text-light opacity-75">Status</th>
                        <th className="bg-transparent text-light opacity-75">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(course => (
                        <tr key={course._id} className="border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                          <td className="text-white py-3">
                            <Link to={`/courses/${course._id}`} className="text-white text-decoration-none">
                              {course.title}
                            </Link>
                          </td>
                          <td className="text-light opacity-75 py-3">{course.instructor?.name || 'Unknown'}</td>
                          <td className="text-light opacity-75 py-3">{course.category}</td>
                          <td className="py-3">
                            <span className={`badge ${
                              course.level === 'beginner' ? 'bg-success' : 
                              course.level === 'intermediate' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {course.level}
                            </span>
                          </td>
                          <td className="text-light opacity-75 py-3">{course.enrollmentCount}</td>
                          <td className="py-3">
                            <span className={`badge ${course.isPublished ? 'bg-success' : 'bg-secondary'}`}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="d-flex gap-2">
                              <Link 
                                to={`/courses/${course._id}/edit`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteCourse(course._id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-light opacity-75 text-center py-5">No courses found</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Generate mock data for demo purposes
function generateMockData() {
  const enrollmentTrends = [];
  const platformGrowth = [];
  let cumulative = 0;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const enrollments = Math.floor(Math.random() * 20) + 1;
    cumulative += enrollments;
    
    enrollmentTrends.push({ date: dateStr, enrollments });
    platformGrowth.push({ date: dateStr, total: cumulative });
  }
  
  const userDistribution = [
    { name: 'Students', value: 45, color: '#6366f1' },
    { name: 'Instructors', value: 8, color: '#10b981' },
    { name: 'Admins', value: 2, color: '#f59e0b' }
  ];
  
  const courseStatus = [
    { name: 'Published', count: 25 },
    { name: 'Draft', count: 10 }
  ];
  
  return { enrollmentTrends, platformGrowth, userDistribution, courseStatus };
}

export default AdminDashboard;
