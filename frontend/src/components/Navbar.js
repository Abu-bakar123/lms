import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Home, 
  Info, 
  GraduationCap, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Users,
  BookMarked,
  Award
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/about', label: 'About', icon: Info },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/verify', label: 'Verify Certificate', icon: Award },
  ];

  const dashboardLinks = [];
  if (isAdmin) {
    dashboardLinks.push({ to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard });
  }
  if (isInstructor) {
    dashboardLinks.push({ to: '/instructor/dashboard', label: 'Instructor Dashboard', icon: Users });
  }
  if (user) {
    dashboardLinks.push({ to: '/student/dashboard', label: 'My Courses', icon: BookMarked });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism Header */}
      <div className="bg-primary/95 backdrop-blur-md shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-accent p-2 rounded-lg"
              >
                <GraduationCap className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="text-white font-heading font-bold text-xl">
                LearnPro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <link.icon className="h-4 w-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              {/* Dashboard Dropdown */}
              {dashboardLinks.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-medium">Dashboards</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="py-2">
                          {dashboardLinks.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                              <link.icon className="h-4 w-4" />
                              <span className="font-medium">{link.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="bg-accent rounded-full p-1">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                    <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span className="font-medium">Profile</span>
                          </Link>
                          <hr className="my-2 border-gray-100" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-400 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-primary/95 backdrop-blur-md border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}

                {dashboardLinks.length > 0 && (
                  <>
                    <div className="pt-2 pb-1">
                      <span className="px-4 text-sm text-white/50 font-medium">Dashboards</span>
                    </div>
                    {dashboardLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <link.icon className="h-5 w-5" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    ))}
                  </>
                )}

                {user ? (
                  <>
                    <hr className="border-white/10 my-2" />
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex space-x-3 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 px-4 py-3 text-center text-white/80 hover:text-white font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 px-4 py-3 text-center bg-accent text-primary font-medium rounded-lg hover:bg-accent-400 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
