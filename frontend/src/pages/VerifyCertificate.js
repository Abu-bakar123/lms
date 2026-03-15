import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Search, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { enrollmentsAPI } from '../services/api';

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await enrollmentsAPI.verifyCertificate(certificateId.trim());
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center bg-white/10 rounded-circle p-4 mb-4">
                <Award size={48} className="text-white" />
              </div>
              <h1 className="display-4 fw-bold text-white mb-3">Verify Certificate</h1>
              <p className="text-white-70">
                Enter the certificate ID to verify the authenticity of a completion certificate
              </p>
            </div>

            <div className="card border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="card-body p-5">
                <form onSubmit={handleVerify}>
                  <div className="mb-4">
                    <label htmlFor="certificateId" className="form-label fw-bold">
                      Certificate ID
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <Search size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="certificateId"
                        placeholder="Enter certificate ID (e.g., CERT-123456)"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <XCircle size={18} className="me-2" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                    style={{ borderRadius: '8px' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Award className="me-2" size={20} />
                        Verify Certificate
                      </>
                    )}
                  </button>
                </form>

                {result && (
                  <div className="mt-4 p-4 rounded-3" style={{ background: '#d4edda' }}>
                    <div className="d-flex align-items-center mb-3">
                      <CheckCircle size={24} className="text-success me-2" />
                      <h5 className="mb-0 text-success fw-bold">Certificate Verified!</h5>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <p className="mb-1"><strong>Student Name:</strong></p>
                        <p className="text-muted mb-0">{result.studentName}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Course Name:</strong></p>
                        <p className="text-muted mb-0">{result.courseName}</p>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div className="row">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <p className="mb-1"><strong>Issue Date:</strong></p>
                        <p className="text-muted mb-0">
                          {new Date(result.issueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Instructor:</strong></p>
                        <p className="text-muted mb-0">{result.instructorName}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="text-white text-decoration-none">
                <BookOpen size={18} className="me-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
