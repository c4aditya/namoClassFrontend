import React, { useEffect, useState } from 'react';
import { getPendingUsers } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
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
    fetchPending();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <Link to="/admin/view-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/view-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/view-users' ? '#fff' : '#475569' }}>Total Users</Link>
        <Link to="/admin/approve-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/approve-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/approve-users' ? '#fff' : '#475569' }}>Approve Users</Link>
        <Link to="/admin/pending-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/pending-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/pending-users' ? '#fff' : '#475569' }}>Pending Users</Link>
      </div>

      <h1 className="dashboard-title">Pending Approvals</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <thead style={{ background: 'var(--secondary)', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                  <td style={{ padding: '1rem' }}>{user.name}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ marginTop: '2rem', color: 'var(--text-gray)' }}>No pending users found.</p>
      )}
    </div>
  );
};

export default PendingUsers;
