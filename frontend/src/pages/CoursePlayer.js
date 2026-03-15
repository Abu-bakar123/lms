import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentsAPI, coursesAPI } from '../services/api';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle,
  Circle,
  Menu,
  X,
  BookOpen,
  Clock,
  BarChart2,
  Settings,
  ArrowLeft
} from 'lucide-react';
import './CoursePlayer.css';

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  
  // Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Fetch enrollment with course content
  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setLoading(true);
        
        // First, get user's enrollments to find the right one
        const enrollments = await enrollmentsAPI.getMyEnrollments();
        const courseEnrollment = enrollments.data.find(e => e.course._id === id || e.course === id);
        
        if (!courseEnrollment) {
          setError('You are not enrolled in this course');
          setLoading(false);
          return;
        }
        
        // Get full course details with lessons
        const courseResponse = await coursesAPI.getById(id);
        const courseData = courseResponse.data;
        
        setCourse(courseData);
        setEnrollment(courseEnrollment);
        
        // Set current lesson
        const lessons = courseData.lessons || [];
        let lessonIndex = 0;
        
        if (courseEnrollment.currentLesson) {
          const currentLessonId = courseEnrollment.currentLesson.toString();
          lessonIndex = lessons.findIndex(l => l._id === currentLessonId);
          if (lessonIndex === -1) lessonIndex = 0;
        }
        
        if (lessons.length > 0) {
          setCurrentLesson(lessons[lessonIndex]);
          setCurrentLessonIndex(lessonIndex);
          
          // Expand first module by default
          setExpandedModules({ 0: true });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching enrollment:', err);
        setError(err.response?.data?.message || 'Failed to load course');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchEnrollment();
    }
  }, [id, user]);

  // Heartbeat - send progress every 30 seconds
  useEffect(() => {
    if (!enrollment || !currentLesson || !isPlaying) return;
    
    const sendHeartbeat = async () => {
      try {
        await enrollmentsAPI.updateProgress(enrollment._id, {
          lessonId: currentLesson._id,
          currentTime: Math.floor(currentTime),
          completed: false
        });
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };
    
    heartbeatRef.current = setInterval(sendHeartbeat, 30000);
    
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [enrollment, currentLesson, isPlaying, currentTime]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Video Event Handlers
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setCurrentTime(video.currentTime);
    
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setDuration(video.duration);
    
    // Resume from saved position
    if (enrollment?.currentTime && currentLesson) {
      // Only resume if it's the same lesson
      const savedLessonId = enrollment.currentLesson?._id || enrollment.currentLesson;
      if (savedLessonId === currentLesson._id && enrollment.lastAccessedAt) {
        const timeSinceLastAccess = Date.now() - new Date(enrollment.lastAccessedAt).getTime();
        // Only resume if accessed within last 5 minutes
        if (timeSinceLastAccess < 300000) {
          video.currentTime = enrollment.currentTime || 0;
        }
      }
    }
  }, [enrollment, currentLesson]);

  const handleEnded = useCallback(async () => {
    setIsPlaying(false);
    await markAsComplete();
    goToNextLesson();
  }, [currentLessonIndex, course]);

  const skip = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
  }, []);

  const adjustVolume = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const value = parseFloat(e.target.value);
    video.volume = value;
    setVolume(value);
    if (value === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }, []);

  // Lesson Navigation
  const selectLesson = useCallback(async (lesson, index) => {
    // Save progress for current lesson before switching
    if (currentLesson && enrollment) {
      try {
        await enrollmentsAPI.updateProgress(enrollment._id, {
          lessonId: currentLesson._id,
          currentTime: Math.floor(currentTime),
          completed: enrollment.completedLessons?.includes(currentLesson._id)
        });
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }
    
    setCurrentLesson(lesson);
    setCurrentLessonIndex(index);
    setCurrentTime(0);
    setIsPlaying(false);
    
    // Update expanded module
    setExpandedModules(prev => ({ ...prev, [index]: true }));
  }, [currentLesson, enrollment, currentTime]);

  const markAsComplete = useCallback(async () => {
    if (!enrollment || !currentLesson) return;
    
    try {
      const response = await enrollmentsAPI.updateProgress(enrollment._id, {
        lessonId: currentLesson._id,
        completed: true
      });
      
      setEnrollment(response.data);
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  }, [enrollment, currentLesson]);

  const goToPrevLesson = useCallback(() => {
    if (!course || currentLessonIndex <= 0) return;
    const prevIndex = currentLessonIndex - 1;
    selectLesson(course.lessons[prevIndex], prevIndex);
  }, [course, currentLessonIndex, selectLesson]);

  const goToNextLesson = useCallback(() => {
    if (!course || currentLessonIndex >= course.lessons.length - 1) return;
    const nextIndex = currentLessonIndex + 1;
    selectLesson(course.lessons[nextIndex], nextIndex);
  }, [course, currentLessonIndex, selectLesson]);

  // Toggle module expansion
  const toggleModule = useCallback((moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  }, []);

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!course || !enrollment) return 0;
    const completedCount = enrollment.completedLessons?.length || 0;
    const totalLessons = course?.modules?.reduce((acc, module) => {
      return acc + (module?.lessons?.length || 0);
    }, 0) || course?.lessons?.length || 0;
    
    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId) => {
    return enrollment?.completedLessons?.some(id => 
      id.toString() === lessonId.toString()
    );
  };

  if (loading) {
    return (
      <div className="course-player-loading">
        <div className="loading-skeleton">
          <div className="skeleton-video" style={{ height: '400px', background: '#e0e0e0', borderRadius: '8px' }}></div>
          <div className="skeleton-content" style={{ padding: '20px' }}>
            <div className="skeleton-line" style={{ height: '24px', width: '60%', background: '#e0e0e0', marginBottom: '12px' }}></div>
            <div className="skeleton-line" style={{ height: '16px', width: '80%', background: '#e0e0e0', marginBottom: '8px' }}></div>
            <div className="skeleton-line" style={{ height: '16px', width: '40%', background: '#e0e0e0' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-player-error">
        <div className="error-content">
          <BookOpen size={48} />
          <h2>Unable to Load Course</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/courses')} className="btn btn-primary">
            <ArrowLeft size={18} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="course-player-error">
        <div className="error-content">
          <BookOpen size={48} />
          <h2>Course Not Found</h2>
          <p>This course may have been removed or you may not have access.</p>
          <button onClick={() => navigate('/courses')} className="btn btn-primary">
            <ArrowLeft size={18} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const lessons = course?.modules?.flatMap(m => m?.lessons || []) || course?.lessons || [];
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const progress = calculateProgress();

  return (
    <div 
      className={`course-player-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      ref={containerRef}
    >
      {/* Sidebar */}
      <aside className={`course-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle-mobile d-lg-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="course-info">
            <Link to={`/courses/${course._id}`} className="back-link">
              <ArrowLeft size={16} />
              Back to Course
            </Link>
            <h3 className="course-title">{course.title}</h3>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Curriculum */}
        <div className="curriculum">
          <div className="curriculum-header">
            <BookOpen size={18} />
            <span>Course Content</span>
            <span className="lesson-count">{lessons.length} lessons</span>
          </div>
          
          <div className="lesson-list">
            {lessons.map((lesson, index) => (
              <div 
                key={lesson._id || index}
                className={`lesson-item ${currentLessonIndex === index ? 'active' : ''} ${isLessonCompleted(lesson._id) ? 'completed' : ''}`}
                onClick={() => selectLesson(lesson, index)}
              >
                <div className="lesson-status">
                  {isLessonCompleted(lesson._id) ? (
                    <CheckCircle size={18} className="completed-icon" />
                  ) : currentLessonIndex === index ? (
                    <Play size={18} className="playing-icon" />
                  ) : (
                    <Circle size={18} className="pending-icon" />
                  )}
                </div>
                <div className="lesson-info">
                  <span className="lesson-title">{lesson.title}</span>
                  {lesson.duration && (
                    <span className="lesson-duration">
                      <Clock size={12} />
                      {lesson.duration} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="course-main">
        {/* Mobile Sidebar Toggle */}
        <button 
          className="sidebar-toggle d-lg-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Video Player */}
        <div className="video-container">
          {currentLesson?.videoUrl ? (
            <video
              ref={videoRef}
              className="video-element"
              src={currentLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              onClick={togglePlay}
              poster={course.thumbnail}
            />
          ) : (
            <div className="video-placeholder">
              <BookOpen size={64} />
              <p>No video available for this lesson</p>
            </div>
          )}
          
          {/* Video Controls Overlay */}
          <div className={`video-controls ${showControls ? 'visible' : 'hidden'}`}>
            {/* Progress Bar */}
            <div className="progress-container" onClick={handleSeek}>
              <div className="progress-bg">
                <div 
                  className="progress-buffered" 
                  style={{ width: `${(buffered / duration) * 100}%` }}
                />
                <div 
                  className="progress-played" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="controls-row">
              <div className="controls-left">
                <button className="control-btn" onClick={togglePlay}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                
                <button className="control-btn" onClick={() => skip(-10)}>
                  <SkipBack size={20} />
                </button>
                
                <button className="control-btn" onClick={() => skip(10)}>
                  <SkipForward size={20} />
                </button>
                
                <div className="volume-control">
                  <button className="control-btn" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
                
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="controls-right">
                <button className="control-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info */}
        <div className="lesson-content">
          <div className="lesson-header">
            <div className="lesson-meta">
              <span className="lesson-number">Lesson {currentLessonIndex + 1} of {lessons.length}</span>
              {isLessonCompleted(currentLesson?._id) && (
                <span className="completed-badge">
                  <CheckCircle size={14} />
                  Completed
                </span>
              )}
            </div>
            <h1 className="lesson-title">{currentLesson?.title}</h1>
            {currentLesson?.description && (
              <p className="lesson-description">{currentLesson.description}</p>
            )}
          </div>
          
          <div className="lesson-actions">
            <button 
              className={`btn btn-complete ${isLessonCompleted(currentLesson?._id) ? 'completed' : ''}`}
              onClick={markAsComplete}
              disabled={isLessonCompleted(currentLesson?._id)}
            >
              {isLessonCompleted(currentLesson?._id) ? (
                <>
                  <CheckCircle size={18} />
                  Completed
                </>
              ) : (
                <>
                  <Check size={18} />
                  Mark as Complete
                </>
              )}
            </button>
            
            <div className="navigation-buttons">
              <button 
                className="btn btn-nav"
                onClick={goToPrevLesson}
                disabled={isFirstLesson}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              
              <button 
                className="btn btn-nav"
                onClick={goToNextLesson}
                disabled={isLastLesson}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursePlayer;
