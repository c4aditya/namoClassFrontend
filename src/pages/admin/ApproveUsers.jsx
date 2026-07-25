import React, { useEffect, useState } from 'react';
import { getPendingUsers, approveUser } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const ApproveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchPending = async () => {
    try {
      const { data } = await getPendingUsers();
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch pending users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      const { data } = await approveUser(id);
      toast.success(data.message);
      fetchPending(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve user");
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <Link to="/admin/view-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/view-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/view-users' ? '#fff' : '#475569' }}>Total Users</Link>
        <Link to="/admin/approve-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/approve-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/approve-users' ? '#fff' : '#475569' }}>Approve Users</Link>
        <Link to="/admin/pending-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/pending-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/pending-users' ? '#fff' : '#475569' }}>Pending Users</Link>
        <Link to="/admin/deleted-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/deleted-users' ? '#dc2626' : '#f1f5f9', color: location.pathname === '/admin/deleted-users' ? '#fff' : '#475569' }}>Deleted Users</Link>
      </div>

      <h1 className="dashboard-title">Approve Users</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {users.map((user) => (
            <div key={user._id} className="course-card" style={{ padding: '1.5rem' }}>
              <h3 className="course-title">{user.name}</h3>
              <p style={{ color: 'var(--text-gray)', marginBottom: '1rem' }}>{user.email}</p>
              <button 
                onClick={() => handleApprove(user._id)}
                className="btn btn-primary"
              >
                Approve User
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: '2rem', color: 'var(--text-gray)' }}>No users awaiting approval.</p>
      )}
    </div>
  );
};

export default ApproveUsers;
