import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    oneMonthUsers: 0,
    twoMonthUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAdminStats();
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, color: '#3b82f6' },
    { title: 'Pending Users', value: stats.pendingUsers, color: '#f59e0b' },
    { title: '1 Month Users', value: stats.oneMonthUsers, color: '#10b981' },
    { title: '2 Month (Premium)', value: stats.twoMonthUsers, color: '#a855f7' },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 className="dashboard-title">Admin Dashboard</h1>
      
      <div className="course-grid" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        {cards.map((card, index) => (
          <div key={index} style={{ 
            backgroundColor: card.color, 
            color: 'white', 
            padding: '1.5rem', 
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.125rem', opacity: 0.9 }}>{card.title}</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '600px' }}>
        <div className="course-card" style={{ padding: '1.5rem' }}>
          <h2 className="course-title" style={{ marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '1rem' 
          }}>
            <Link to="/admin/pending-users" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              View Pending
            </Link>
            <Link to="/admin/approve-users" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Approve Users
            </Link>
            <Link to="/admin/create-course" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Create Course
            </Link>
            <Link to="/admin/add-user" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Add User
            </Link>
            <Link to="/admin/view-users" className="btn" style={{ background: '#f3f4f6', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              View Total Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
