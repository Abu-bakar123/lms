import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../services/api';

const EditCourse = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    isFree: false,
    isPublished: false,
    thumbnail: '',
    requirements: [],
    objectives: [],
    tags: []
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, catRes] = await Promise.all([
        coursesAPI.getById(id),
        coursesAPI.getCategories()
      ]);
      const course = courseRes.data.course;
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'beginner',
        price: course.price || 0,
        isFree: course.isFree || false,
        isPublished: course.isPublished || false,
        thumbnail: course.thumbnail || '',
        requirements: course.requirements || [],
        objectives: course.objectives || [],
        tags: course.tags || []
      });
      setCategories(catRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    });
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim());
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await coursesAPI.update(id, formData);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="mb-4">Edit Course</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Course Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Category *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      list="categories"
                      required
                    />
                    <datalist id="categories">
                      {categories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="level" className="form-label">Level</label>
                    <select
                      className="form-select"
                      id="level"
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
                  <div className="col-md-4 mb-3">
                    <label htmlFor="price" className="form-label">Price ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-md-4 mb-3 d-flex align-items-center">
                    <div className="form-check mt-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isFree"
                        name="isFree"
                        checked={formData.isFree}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="isFree">
                        Free Course
                      </label>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3 d-flex align-items-center">
                    <div className="form-check mt-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isPublished"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="isPublished">
                        Publish Course
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="thumbnail" className="form-label">Thumbnail URL</label>
                  <input
                    type="url"
                    className="form-control"
                    id="thumbnail"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="requirements" className="form-label">Requirements (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="requirements"
                    value={formData.requirements.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'requirements')}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="objectives" className="form-label">Learning Objectives (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="objectives"
                    value={formData.objectives.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'objectives')}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'tags')}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
