import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CourseCard from '../components/CourseCard';
import { Navigate } from 'react-router-dom';
import { fetchCourses } from '../redux/authSlice';
import { getFilteredCourses } from '../services/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, courses, isAuthenticated } = useSelector((state) => state.auth);
  const [selectedFilter, setSelectedFilter] = useState('Month 1');
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [filterLoading, setFilterLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const loadFilteredCourses = async () => {
      setFilterLoading(true);
      try {
        let param = '1';
        if (selectedFilter === 'All') param = 'all';
        if (selectedFilter === 'Month 1') param = '1';
        if (selectedFilter === 'Month 2') param = '2';

        const { data } = await getFilteredCourses(param);
        if (isMounted) {
          if (data?.success && Array.isArray(data?.courses)) {
            setDisplayedCourses(data.courses);
          } else {
            setDisplayedCourses([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch filtered courses:", err);
        if (isMounted) setDisplayedCourses([]);
      } finally {
        if (isMounted) setFilterLoading(false);
      }
    };

    if (isAuthenticated) {
      loadFilteredCourses();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedFilter, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const is2MonthUser = user?.enrolledMonth === "2" || user?.enrolledMonth === "2 month" || user?.enrolledMonth === "2 months";

  const month1Courses = (displayedCourses || []).filter(c => String(c?.duration || '').trim() === '1');
  const month2Courses = (displayedCourses || []).filter(c => String(c?.duration || '').trim() === '2');

  const activeCourses = selectedFilter === 'Month 1' || selectedFilter === '1'
    ? month1Courses
    : selectedFilter === 'Month 2' || selectedFilter === '2'
      ? is2MonthUser
        ? month2Courses
        : month1Courses
      : displayedCourses;

  const handleFilterChange = (newFilter) => {
    setSelectedFilter(newFilter);
    setDisplayedCourses([]);
  };

  return (
    <>
      {/* Full Width Welcome Banner Section */}
      <header className="full-width-banner-wrapper">
        <div
          className="container"
          style={{
            paddingTop: '3rem',
            paddingBottom: '3rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            position: 'relative'
          }}
        >
          <div style={{ flex: '1 1 340px', zIndex: 1 }}>
            <span style={{
              background: 'rgba(59, 130, 246, 0.25)',
              color: '#60a5fa',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '4px 14px',
              borderRadius: '100px',
              display: 'inline-block',
              marginBottom: '0.75rem',
              border: '1px solid rgba(96, 165, 250, 0.3)'
            }}>
              🎓 Aviation Learning Portal
            </span>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.2, overflow: 'hidden' }}>
              Welcome Back, <span style={{ color: '#60a5fa' }}>{user?.name ? user.name.trim().split(' ')[0] : 'Student'}</span>! 👋
            </h1>

            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginTop: '0.5rem', maxWidth: '560px', lineHeight: 1.6 }}>
              "Continue your learning journey and complete your next class today."
            </p>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                Enrolled: <strong style={{ color: '#60a5fa' }}>{user?.enrolledMonth || '1 Month'}</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingBottom: '3rem' }}>
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: 0
            }}>
              <span style={{ width: '6px', height: '32px', background: 'var(--primary)', borderRadius: '100px' }}></span>
              Your Courses
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="course-duration-filter" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Filter:
              </label>
              <select
                id="course-duration-filter"
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s'
                }}
              >
                <option value="All">All</option>
                <option value="Month 1">Month 1</option>
                <option value="Month 2">Month 2</option>
              </select>
            </div>
          </div>

          {(() => {
            const isClassesPaused = Array.isArray(courses) && courses.length > 0 && courses.some(c => c.isPaused === true);

            if (isClassesPaused) {
              return (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem 1rem',
                    width: '100%'
                  }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '2.5rem 2rem',
                      maxWidth: '540px',
                      width: '100%',
                      textAlign: 'center',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        background: '#fef3c7',
                        color: '#d97706',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
                      }}
                    >
                      📢
                    </div>

                    <h3
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      Classes Paused
                    </h3>

                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1.5rem',
                        border: '1px solid #f1f5f9',
                        textAlign: 'left'
                      }}
                    >
                      <p
                        style={{
                          fontSize: '1rem',
                          lineHeight: 1.6,
                          color: '#334155',
                          marginBottom: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        Due to a holiday, today's classes have been paused.
                      </p>
                      <p
                        style={{
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          color: '#475569',
                          marginBottom: '0.75rem'
                        }}
                      >
                        Classes are also paused on Saturday and Sunday.
                      </p>
                      <p
                        style={{
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          color: '#2563eb',
                          fontWeight: 600,
                          margin: 0
                        }}
                      >
                        Your classes will resume from the next working day.
                      </p>
                    </div>

                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        margin: 0,
                        fontWeight: 500
                      }}
                    >
                      Thank you for your patience.
                    </p>
                  </div>
                </div>
              );
            }

            if (filterLoading) {
              return (
                <div style={{
                  padding: '3.5rem 1rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.85rem',
                  minHeight: '220px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #cbd5e1',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
                    Loading courses...
                  </p>
                </div>
              );
            }

            const renderCourseList = (list) => {
              const userLastWatched = user?.lastWatchedClass || 0;
              const nextClassIndex = (courses || []).findIndex(
                (c, idx) => !(idx === 0 || idx <= userLastWatched || c.accessStatus === 'Approved')
              );

              return list.map((course, idx) => {
                const originalIndex = (courses || []).findIndex(c => c._id === course._id);
                const index = course.globalIndex !== undefined
                  ? course.globalIndex
                  : (originalIndex !== -1 ? originalIndex : idx);
                const accessTime = new Date(user?.approvedAt || user?.createdAt).getTime();
                const unlockTime = course.unlockTime !== undefined
                  ? course.unlockTime
                  : (accessTime + index * 12 * 60 * 60 * 1000);
                const isLocked = course.isLocked !== undefined ? course.isLocked : (Date.now() < unlockTime);
                const isNextClass = course.isNextClass !== undefined ? course.isNextClass : (index === nextClassIndex);
                const isFutureLocked = course.isFutureLocked !== undefined ? course.isFutureLocked : (nextClassIndex !== -1 && index > nextClassIndex);

                return (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isLocked={isLocked}
                    unlockTime={unlockTime}
                    index={index}
                    isNextClass={isNextClass}
                    isFutureLocked={isFutureLocked}
                  />
                );
              });
            };

            return activeCourses.length > 0 ? (
              <div className="course-grid">
                {renderCourseList(activeCourses)}
              </div>
            ) : (
              <div style={{
                background: '#eff6ff',
                padding: '2.5rem',
                borderRadius: '1rem',
                textAlign: 'center',
                border: '1px solid #dbeafe'
              }}>
                <p style={{ fontSize: '1.25rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {selectedFilter !== 'All' ? 'No courses found for this filter.' : 'No courses found yet.'}
                </p>
                <p style={{ color: '#2563eb' }}>
                  {selectedFilter !== 'All'
                    ? `There are no ${selectedFilter} courses available in your current enrollment.`
                    : 'Please wait for admin to update your enrollment or check back later.'}
                </p>
              </div>
            );
          })()}
        </section>
      </div>
    </>
  );
};

export default Dashboard;
