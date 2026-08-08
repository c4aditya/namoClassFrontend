import React, { useEffect, useState } from 'react';
import {
  getAdminStats,
  pauseResumeCourses,
  getCoursePauseStatus,
  getApprovedPendingLoginUsers
} from '../../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    oneMonthUsers: 0,
    twoMonthUsers: 0
  });

  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingLoginUsers, setPendingLoginUsers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAdminStats();
        setStats(data.stats);

        const status = await getCoursePauseStatus();
        setIsPaused(status.data.isCoursePaused);

        const pendingLoginData = await getApprovedPendingLoginUsers();
        setPendingLoginUsers(pendingLoginData.data.users);

      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
  }, []); 

  const handlePauseResume = async () => {
    try {
      setLoading(true);

      const newStatus = !isPaused;

      await pauseResumeCourses(newStatus);

      setIsPaused(newStatus);

      alert(
        newStatus
          ? "All classes paused successfully."
          : "All classes resumed successfully."
      );

    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, color: '#3b82f6' },
    { title: 'Pending Users', value: stats.pendingUsers, color: '#f59e0b' },
    { title: '1 Month Users', value: stats.oneMonthUsers, color: '#10b981' },
    { title: '2 Month (Premium)', value: stats.twoMonthUsers, color: '#a855f7' },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 className="dashboard-title" style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>
      
      {/* FIRST: Quick Actions */}
      <div className="course-card" style={{ padding: '1.25rem', marginBottom: '1.75rem', width: '100%' }}>
        <h2 className="course-title" style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>Quick Actions</h2>
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <Link to="/admin/class-access-requests" className="btn" style={{ background: '#2563eb', color: '#ffffff', textDecoration: 'none', fontWeight: 600, padding: '0 1rem', height: '38px', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: '0.5rem' }}>
            Class Access Requests
          </Link>
          <Link to="/admin/approve-users" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', textDecoration: 'none', padding: '0 1rem', height: '38px', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: '0.5rem' }}>
            Approve Users
          </Link>
          <Link to="/admin/create-course" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', textDecoration: 'none', padding: '0 1rem', height: '38px', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: '0.5rem' }}>
            Create Course
          </Link>
          <Link to="/admin/add-user" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', textDecoration: 'none', padding: '0 1rem', height: '38px', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: '0.5rem' }}>
            Add User
          </Link>
          <Link to="/admin/view-users" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', textDecoration: 'none', padding: '0 1rem', height: '38px', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: '0.5rem' }}>
            View Total Users
          </Link>

          <button
            onClick={handlePauseResume}
            disabled={loading}
            className="btn"
            style={{
              background: isPaused ? "#16a34a" : "#dc2626",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              padding: '0 1rem',
              height: '38px',
              width: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              borderRadius: '0.5rem'
            }}
          >
            {loading
              ? "Please Wait..."
              : isPaused
              ? "Resume All Classes"
              : "Pause All Classes"}
          </button>
        </div>
      </div>

      {/* SECOND: Dashboard Statistics (4 Compact Boxes in Single Row) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        {cards.map((card, index) => (
          <div key={index} style={{ 
            backgroundColor: card.color, 
            color: 'white', 
            padding: '1rem 1.25rem', 
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '0.95rem', opacity: 0.9, margin: 0, fontWeight: 600 }}>{card.title}</h3>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* THIRD: Approved Users (Pending First Login) */}
      <div className="course-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 className="course-title" style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Approved Users (Pending First Login)</h2>
        {pendingLoginUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-gray)' }}>
              <thead style={{ background: 'var(--secondary)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Course Type</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Approval Date</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoginUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-gray)' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{user.enrolledMonth || '1 month'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                      {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-gray)', margin: 0 }}>No approved users pending login.</p>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
