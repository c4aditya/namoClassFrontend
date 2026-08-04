import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CourseCard from '../components/CourseCard';
import { Navigate } from 'react-router-dom';
import { fetchCourses } from '../redux/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, courses, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.25rem', color: '#64748b' }}>Loading courses...</p>
      </div>
    );
  }

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
            justify: 'space-between',
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
              Welcome Back, <span style={{ color: '#60a5fa' }}>{user?.name || 'Student'}</span>! 👋
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
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <span style={{ width: '6px', height: '32px', background: 'var(--primary)', borderRadius: '100px' }}></span>
            Your Courses
          </h2>

          {courses.length > 0 ? (
            <div className="course-grid">
              {(() => {
                const userLastWatched = user?.lastWatchedClass || 0;
                const nextClassIndex = courses.findIndex(
                  (c, idx) => !(idx === 0 || idx <= userLastWatched || c.accessStatus === 'Approved')
                );

                return courses.map((course, index) => {
                  const accessTime = new Date(user?.approvedAt || user?.createdAt).getTime();
                  const unlockTime = accessTime + index * 12 * 60 * 60 * 1000;
                  const isLocked = Date.now() < unlockTime;
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
              })()}
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
                No courses found yet.
              </p>
              <p style={{ color: '#2563eb' }}>Please wait for admin to update your enrollment or check back later.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Dashboard;
