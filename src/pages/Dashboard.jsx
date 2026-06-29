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
      <div className="container" style={{paddingTop: '3rem', textAlign: 'center'}}>
        <p style={{fontSize: '1.25rem', color: '#64748b'}}>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{paddingTop: '3rem', paddingBottom: '3rem'}}>
      <header className="dashboard-header">
        <h1 className="dashboard-title">My Learning Dashboard</h1>
        <p style={{fontSize: '1.125rem', color: '#64748b', marginTop: '0.5rem'}}>
          Enrolled for: <span className="text-primary">{user?.enrolledMonth} months</span>
        </p>
      </header>

      <section>
        <h2 style={{
          fontSize: '1.5rem', 
          fontWeight: 700, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <span style={{width: '6px', height: '32px', background: 'var(--primary)', borderRadius: '100px'}}></span>
          Your Courses
        </h2>
        
        {courses.length > 0 ? (
          <div className="course-grid">
            {courses.map((course, index) => {
              const accessTime = new Date(user?.approvedAt || user?.createdAt).getTime();
              const unlockTime = accessTime + index * 12 * 60 * 60 * 1000;
              const isLocked = Date.now() < unlockTime;
              
              return (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  isLocked={isLocked}
                  unlockTime={unlockTime}
                />
              );
            })}
          </div>
        ) : (
          <div style={{
            background: '#eff6ff', 
            padding: '2.5rem', 
            borderRadius: '1rem', 
            textAlign: 'center',
            border: '1px solid #dbeafe'
          }}>
            <p style={{fontSize: '1.25rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.5rem'}}>
              No courses found yet.
            </p>
            <p style={{color: '#2563eb'}}>Please wait for admin to update your enrollment or check back later.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
