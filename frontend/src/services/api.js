import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  githubLogin: (data) => api.post('/auth/github', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data)
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  getInstructorProfile: (id) => api.get(`/users/instructor/${id}`)
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getCategories: () => api.get('/courses/categories'),
  getCourseStats: (id) => api.get(`/courses/${id}/stats`),
  migrateToModules: (id) => api.post(`/courses/${id}/migrate`),
  
  // Module management
  addModule: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  updateModule: (courseId, moduleId, data) => api.put(`/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (courseId, moduleId) => api.delete(`/courses/${courseId}/modules/${moduleId}`),
  reorderModules: (courseId, moduleIds) => api.put(`/courses/${courseId}/modules/reorder`, { moduleIds }),
  
  // Lesson management within modules
  addLesson: (courseId, moduleId, data) => api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, data),
  updateLesson: (courseId, moduleId, lessonId, data) => api.put(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data),
  removeLesson: (courseId, moduleId, lessonId) => api.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
  reorderLessons: (courseId, moduleId, lessonIds) => api.put(`/courses/${courseId}/modules/${moduleId}/lessons/reorder`, { lessonIds }),
  
  // Legacy lesson routes (backward compatibility)
  addLessonLegacy: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  removeLessonLegacy: (courseId, lessonId) => api.delete(`/courses/${courseId}/lessons/${lessonId}`)
};

// Enrollments API
export const enrollmentsAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  getMyEnrollments: () => api.get('/enrollments/my-courses'),
  getById: (id) => api.get(`/enrollments/${id}`),
  getEnrollmentWithCourse: (id) => api.get(`/enrollments/${id}/with-course`),
  updateProgress: (id, data) => api.put(`/enrollments/${id}/progress`, data),
  completeLesson: (id, data) => api.post(`/enrollments/${id}/complete-lesson`, data),
  unenroll: (id) => api.delete(`/enrollments/${id}`),
  getAll: () => api.get('/enrollments'),
  getStats: () => api.get('/enrollments/stats'),
  getAnalytics: () => api.get('/enrollments/analytics'),
  getCourseEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
  
  // Certificate APIs
  generateCertificate: (id) => api.post(`/enrollments/${id}/certificate`),
  getCertificate: (id) => api.get(`/enrollments/${id}/certificate`),
  verifyCertificate: (certificateId) => api.get(`/enrollments/certificate/verify/${certificateId}`)
};

// Reviews API
export const reviewsAPI = {
  getCourseReviews: (courseId) => api.get(`/reviews/course/${courseId}`),
  getAll: (params) => api.get('/reviews', { params }),
  add: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  approve: (id, approved) => api.put(`/reviews/${id}/approve`, { approved })
};

export default api;
