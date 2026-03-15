import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Award, Download, Share2, CheckCircle, Calendar, BookOpen, ArrowRight } from 'lucide-react';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      // Filter enrollments that have certificates or are completed
      const completedCourses = response.data.filter(
        e => e.status === 'completed' || e.progress === 100
      );
      setCertificates(completedCourses);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (enrollmentId) => {
    setGenerating(enrollmentId);
    try {
      const response = await enrollmentsAPI.generateCertificate(enrollmentId);
      if (response.data.certificate) {
        // Refresh the list
        await fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGenerating(null);
    }
  };

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
          <p className="mt-3 text-light">Loading certificates...</p>
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
          <h1 className="text-white fw-bold">My Certificates</h1>
          <p className="text-light opacity-75">View and download your course completion certificates.</p>
        </motion.div>

        {certificates.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="row g-4"
          >
            {certificates.map((enrollment) => (
              <motion.div
                key={enrollment._id}
                variants={itemVariants}
                className="col-md-6 col-lg-4"
              >
                <div 
                  className="card border-0 h-100"
                  style={{ 
                    background: enrollment.certificate 
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.1))' 
                      : 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="card-body p-4">
                    {/* Certificate Icon */}
                    <div className="text-center mb-4">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: '80px', 
                          height: '80px',
                          background: enrollment.certificate 
                            ? 'linear-gradient(135deg, #f59e0b, #eab308)'
                            : 'rgba(255,255,255,0.1)'
                        }}
                      >
                        {enrollment.certificate ? (
                          <Award size={40} className="text-white" />
                        ) : (
                          <BookOpen size={40} className="text-light" />
                        )}
                      </div>
                    </div>

                    {/* Course Info */}
                    <h5 className="text-white fw-bold text-center mb-2">
                      {enrollment.course?.title}
                    </h5>
                    <p className="text-light opacity-75 text-center small mb-3">
                      Completed on {new Date(enrollment.completedAt || enrollment.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>

                    {enrollment.certificate ? (
                      <>
                        {/* Certificate ID */}
                        <div className="text-center mb-4">
                          <small className="text-light opacity-50">Certificate ID</small>
                          <p className="text-warning fw-bold mb-0">{enrollment.certificate}</p>
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-outline-light flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                            onClick={() => {
                              // Generate certificate PDF (would use a library in production)
                              alert('Certificate download would be implemented with a PDF library');
                            }}
                          >
                            <Download size={16} />
                            Download
                          </button>
                          <button 
                            className="btn btn-outline-light d-flex align-items-center justify-content-center"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/verify/${enrollment.certificate}`
                              );
                              alert('Certificate link copied to clipboard!');
                            }}
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Generate Certificate Button */}
                        <button
                          className="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => generateCertificate(enrollment._id)}
                          disabled={generating === enrollment._id}
                        >
                          {generating === enrollment._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Award size={18} />
                              Generate Certificate
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-5"
          >
            <div className="card border-0 py-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <Award size={64} className="text-light opacity-50 mx-auto mb-4" />
              <h4 className="text-white mb-2">No certificates yet</h4>
              <p className="text-light opacity-75 mb-4">
                Complete a course to earn your certificate.
              </p>
              <Link to="/courses" className="btn btn-primary d-inline-flex align-items-center gap-2">
                Browse Courses
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5"
        >
          <div className="card border-0" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <div className="card-body p-4">
              <h5 className="text-white fw-bold mb-3">About Certificates</h5>
              <ul className="text-light opacity-75 mb-0">
                <li className="mb-2">Certificates are generated automatically when you complete a course (100% progress)</li>
                <li className="mb-2">Each certificate has a unique ID that can be verified</li>
                <li className="mb-2">Share your certificates on LinkedIn or add to your resume</li>
                <li>Certificates are permanently linked to your account</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Certificates;
