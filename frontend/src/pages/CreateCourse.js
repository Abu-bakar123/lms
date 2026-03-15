import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../services/api';
import { toast } from 'react-toastify';

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    isFree: false,
    thumbnail: '',
    previewVideo: '',
    requirements: [],
    objectives: [],
    tags: [],
    modules: []
  });

  const [activeTab, setActiveTab] = useState('details');
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await coursesAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Module management
  const addModule = () => {
    const newModuleId = `module_${Date.now()}`;
    const newModule = {
      _id: newModuleId,
      title: '',
      description: '',
      order: formData.modules.length + 1,
      lessons: []
    };
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
    // Auto expand the new module
    setExpandedModules(prev => ({ ...prev, [newModuleId]: true }));
  };

  const updateModule = (moduleId, field, value) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m._id === moduleId ? { ...m, [field]: value } : m
      )
    }));
  };

  const removeModule = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules
        .filter(m => m._id !== moduleId)
        .map((m, i) => ({ ...m, order: i + 1 }))
    }));
    // Remove from expanded modules
    setExpandedModules(prev => {
      const newState = { ...prev };
      delete newState[moduleId];
      return newState;
    });
  };

  // Lesson management within modules
  const addLesson = (moduleId) => {
    const newLessonId = `lesson_${Date.now()}`;
    const newLesson = {
      _id: newLessonId,
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      content: '',
      resourceUrl: '',
      order: 1,
      isFree: false
    };
    
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m._id === moduleId) {
          const updatedLesson = { ...newLesson, order: (m.lessons?.length || 0) + 1 };
          return { ...m, lessons: [...(m.lessons || []), updatedLesson] };
        }
        return m;
      })
    }));
  };

  const updateLesson = (moduleId, lessonId, field, value) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m._id === moduleId) {
          return {
            ...m,
            lessons: (m.lessons || []).map(l => 
              l._id === lessonId ? { ...l, [field]: value } : l
            )
          };
        }
        return m;
      })
    }));
  };

  const removeLesson = (moduleId, lessonId) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m._id === moduleId) {
          return {
            ...m,
            lessons: m.lessons
              .filter(l => l._id !== lessonId)
              .map((l, i) => ({ ...l, order: i + 1 }))
          };
        }
        return m;
      })
    }));
  };

  const toggleModuleExpand = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.title.trim()) {
      setError('Course title is required');
      toast.error('Course title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Course description is required');
      toast.error('Course description is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      toast.error('Please select a category');
      return;
    }
    if (formData.modules.length === 0) {
      setError('Please add at least one module');
      toast.error('Please add at least one module');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clean up temp IDs before sending
      const cleanModules = formData.modules.map(m => ({
        title: m.title,
        description: m.description || '',
        order: m.order,
        lessons: (m.lessons || []).map(l => ({
          title: l.title,
          description: l.description || '',
          videoUrl: l.videoUrl || '',
          duration: l.duration || 0,
          content: l.content || '',
          resourceUrl: l.resourceUrl || '',
          order: l.order,
          isFree: l.isFree || false
        }))
      }));

      const courseData = {
        ...formData,
        modules: cleanModules
      };

      await coursesAPI.create(courseData);
      toast.success('Course created successfully!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create course';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0">Create New Course</h2>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
               
                {/* Tabs */}
                <ul className="nav nav-tabs mb-4">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                      onClick={() => setActiveTab('details')}
                    >
                      Basic Details
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
                </ul>

                <form onSubmit={handleSubmit}>
                  {/* Basic Details Tab */}
                  {activeTab === 'details' && (
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Course Title *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Complete Web Development Bootcamp"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Description *</label>
                          <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="What will students learn in this course?"
                            required
                          />
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Category *</label>
                            <select
                              className="form-select"
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="Web Development">Web Development</option>
                              <option value="Mobile Development">Mobile Development</option>
                              <option value="Data Science">Data Science</option>
                              <option value="Machine Learning">Machine Learning</option>
                              <option value="DevOps">DevOps</option>
                              <option value="Design">Design</option>
                              <option value="Business">Business</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Level</label>
                            <select
                              className="form-select"
                              name="level"
                              value={formData.level}
                              onChange={handleChange}
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Price ($)</label>
                            <input
                              type="number"
                              className="form-control"
                              name="price"
                              value={formData.price}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                            />
                            <div className="form-check mt-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="isFree"
                                name="isFree"
                                checked={formData.isFree}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor="isFree">
                                This is a free course
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Thumbnail URL</label>
                          <input
                            type="url"
                            className="form-control"
                            name="thumbnail"
                            value={formData.thumbnail}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Preview Video URL (YouTube/Vimeo)</label>
                          <input
                            type="url"
                            className="form-control"
                            name="previewVideo"
                            value={formData.previewVideo}
                            onChange={handleChange}
                            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                          />
                          <small className="text-muted">This video will be shown on the course preview page</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Requirements (comma separated)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.requirements.join(', ')}
                            onChange={(e) => handleArrayChange(e, 'requirements')}
                            placeholder="Basic knowledge of..., Computer with..."
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Learning Objectives (comma separated)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.objectives.join(', ')}
                            onChange={(e) => handleArrayChange(e, 'objectives')}
                            placeholder="Learn to..., Understand..., Build..."
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Tags (comma separated)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.tags.join(', ')}
                            onChange={(e) => handleArrayChange(e, 'tags')}
                            placeholder="javascript, react, web development"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Curriculum Tab */}
                  {activeTab === 'curriculum' && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0">Course Modules & Lessons</h5>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addModule}
                        >
                          + Add Module
                        </button>
                      </div>

                      {formData.modules.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded">
                          <h5 className="text-muted mb-3">No modules yet</h5>
                          <p className="text-muted mb-3">Start by adding your first module</p>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={addModule}
                          >
                            + Add First Module
                          </button>
                        </div>
                      ) : (
                        <div>
                          {formData.modules.map((module, moduleIndex) => (
                            <div 
                              key={module._id} 
                              className="card mb-3 border"
                              style={{ borderRadius: '12px' }}
                            >
                              <div 
                                className="card-header bg-light d-flex justify-content-between align-items-center"
                                style={{ borderRadius: '12px 12px 0 0', cursor: 'pointer' }}
                                onClick={() => toggleModuleExpand(module._id)}
                              >
                                <div>
                                  <span className="fw-bold me-2">
                                    Module {moduleIndex + 1}:
                                  </span>
                                  <span>{module.title || 'Untitled Module'}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-secondary">
                                    {(module.lessons || []).length} lessons
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeModule(module._id);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              
                              {expandedModules[module._id] && (
                                <div className="card-body">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold">Module Title *</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={module.title}
                                      onChange={(e) => updateModule(module._id, 'title', e.target.value)}
                                      placeholder="e.g., Getting Started"
                                      required
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Module Description</label>
                                    <textarea
                                      className="form-control"
                                      value={module.description || ''}
                                      onChange={(e) => updateModule(module._id, 'description', e.target.value)}
                                      rows="2"
                                      placeholder="What will students learn in this module?"
                                    />
                                  </div>

                                  {/* Lessons */}
                                  <div className="mt-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <h6 className="mb-0">Lessons</h6>
                                      <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => addLesson(module._id)}
                                      >
                                        + Add Lesson
                                      </button>
                                    </div>

                                    {(module.lessons || []).length === 0 ? (
                                      <p className="text-muted small">No lessons yet. Click "Add Lesson" to add lessons to this module.</p>
                                    ) : (
                                      <div className="list-group">
                                        {(module.lessons || []).map((lesson, lessonIndex) => (
                                          <div 
                                            key={lesson._id} 
                                            className="list-group-item"
                                          >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                              <span className="fw-medium">
                                                Lesson {lessonIndex + 1}: {lesson.title || 'Untitled Lesson'}
                                              </span>
                                              <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => removeLesson(module._id, lesson._id)}
                                              >
                                                Remove
                                              </button>
                                            </div>
                                            <div className="row g-2">
                                              <div className="col-12">
                                                <input
                                                  type="text"
                                                  className="form-control form-control-sm"
                                                  value={lesson.title || ''}
                                                  onChange={(e) => updateLesson(module._id, lesson._id, 'title', e.target.value)}
                                                  placeholder="Lesson title *"
                                                />
                                              </div>
                                              <div className="col-md-6">
                                                <input
                                                  type="url"
                                                  className="form-control form-control-sm"
                                                  value={lesson.videoUrl || ''}
                                                  onChange={(e) => updateLesson(module._id, lesson._id, 'videoUrl', e.target.value)}
                                                  placeholder="Video URL (YouTube, Vimeo, etc.)"
                                                />
                                              </div>
                                              <div className="col-md-3">
                                                <input
                                                  type="number"
                                                  className="form-control form-control-sm"
                                                  value={lesson.duration || 0}
                                                  onChange={(e) => updateLesson(module._id, lesson._id, 'duration', Number(e.target.value))}
                                                  placeholder="Duration (min)"
                                                  min="0"
                                                />
                                              </div>
                                              <div className="col-md-3">
                                                <div className="form-check mt-1">
                                                  <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`free_${lesson._id}`}
                                                    checked={lesson.isFree || false}
                                                    onChange={(e) => updateLesson(module._id, lesson._id, 'isFree', e.target.checked)}
                                                  />
                                                  <label 
                                                    className="form-check-label" 
                                                    htmlFor={`free_${lesson._id}`}
                                                  >
                                                    Free Preview
                                                  </label>
                                                </div>
                                              </div>
                                              <div className="col-12">
                                                <textarea
                                                  className="form-control form-control-sm"
                                                  value={lesson.description || ''}
                                                  onChange={(e) => updateLesson(module._id, lesson._id, 'description', e.target.value)}
                                                  placeholder="Lesson description"
                                                  rows="2"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit */}
                  <div className="mt-4 pt-3 border-top">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Course'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
