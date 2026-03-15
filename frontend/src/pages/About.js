import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold">About Our LMS</h1>
              <p className="lead text-muted">
                Empowering learners worldwide with quality education and expert instruction.
              </p>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://via.placeholder.com/600x400?text=About+Us" 
                alt="About LMS" 
                className="img-fluid rounded" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="mb-4">Our Mission</h2>
              <p className="text-muted lead">
                We believe that education should be accessible to everyone, everywhere. 
                Our Learning Management System provides a platform for instructors to share 
                their knowledge and for students to learn at their own pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">What We Offer</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="fs-1 mb-3">📖</div>
                  <h4>Comprehensive Courses</h4>
                  <p className="text-muted">
                    Access a wide range of courses across various subjects, from programming to business to arts.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="fs-1 mb-3">👨‍🏫</div>
                  <h4>Expert Instructors</h4>
                  <p className="text-muted">
                    Learn from industry professionals with years of real-world experience in their fields.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="fs-1 mb-3">📊</div>
                  <h4>Progress Tracking</h4>
                  <p className="text-muted">
                    Monitor your learning journey with detailed progress tracking and completion certificates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="mb-3">
                <span className="display-4 fw-bold text-primary">500+</span>
              </div>
              <p className="text-muted">Courses Available</p>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <span className="display-4 fw-bold text-primary">100+</span>
              </div>
              <p className="text-muted">Expert Instructors</p>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <span className="display-4 fw-bold text-primary">10,000+</span>
              </div>
              <p className="text-muted">Active Students</p>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <span className="display-4 fw-bold text-primary">50,000+</span>
              </div>
              <p className="text-muted">Certificates Issued</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Our Team</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-md-3">
              <div className="text-center">
                <img 
                  src="https://via.placeholder.com/150x150?text=Team+1" 
                  alt="Team Member" 
                  className="rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <h5>John Doe</h5>
                <p className="text-muted">Founder & CEO</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <img 
                  src="https://via.placeholder.com/150x150?text=Team+2" 
                  alt="Team Member" 
                  className="rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <h5>Jane Smith</h5>
                <p className="text-muted">Head of Education</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <img 
                  src="https://via.placeholder.com/150x150?text=Team+3" 
                  alt="Team Member" 
                  className="rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <h5>Mike Johnson</h5>
                <p className="text-muted">Lead Developer</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <img 
                  src="https://via.placeholder.com/150x150?text=Team+4" 
                  alt="Team Member" 
                  className="rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <h5>Sarah Williams</h5>
                <p className="text-muted">Content Manager</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <div className="container">
          <div className="bg-primary text-white rounded p-5 text-center">
            <h2>Join Our Learning Community</h2>
            <p className="lead mb-4">Start your learning journey today and unlock your potential.</p>
            <div>
              <Link to="/register" className="btn btn-light btn-lg me-2">Get Started</Link>
              <Link to="/courses" className="btn btn-outline-light btn-lg">Browse Courses</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto">
              <h2 className="text-center mb-4">Contact Us</h2>
              <div className="text-center">
                <p className="mb-2">
                  <strong>Email:</strong> support@lms.com
                </p>
                <p className="mb-2">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p>
                  <strong>Address:</strong> 123 Education Street, Learning City, LC 12345
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
