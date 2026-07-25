import React, { useEffect, useState } from 'react';
import { getDeletedUsers, permanentDeleteUser } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const DeletedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const location = useLocation();

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getDeletedUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch deleted users", error);
      toast.error("Failed to fetch deleted users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const handlePermanentDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete user "${userName || 'this user'}"? This action cannot be undone and will completely remove their data.`)) {
      try {
        const { data } = await permanentDeleteUser(userId);
        toast.success(data.message || "User permanently deleted");
        fetchDeletedUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to permanently delete user");
      }
    }
  };

  // Filtered Users based on search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Admin Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <Link to="/admin/view-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/view-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/view-users' ? '#fff' : '#475569' }}>Total Users</Link>
        <Link to="/admin/approve-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/approve-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/approve-users' ? '#fff' : '#475569' }}>Approve Users</Link>
        <Link to="/admin/pending-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/pending-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/pending-users' ? '#fff' : '#475569' }}>Pending Users</Link>
        <Link to="/admin/deleted-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/deleted-users' ? '#dc2626' : '#f1f5f9', color: location.pathname === '/admin/deleted-users' ? '#fff' : '#475569' }}>Deleted Users</Link>
      </div>

      <h1 className="dashboard-title">Deleted Users Directory</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search deleted users by name or email..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="form-input"
          style={{ maxWidth: '400px', padding: '0.6rem 1rem' }}
        />
        <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
          {filteredUsers.length > 0 && `Showing ${indexOfFirstUser + 1} - ${Math.min(indexOfLastUser, filteredUsers.length)} of ${filteredUsers.length} deleted users`}
        </div>
      </div>

      {loading ? (
        <p>Loading Deleted Users...</p>
      ) : filteredUsers.length > 0 ? (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-gray)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#dc2626', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Full Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Signup Date</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Course Duration</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Last Watched Class</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>{user.email}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {user.enrolledMonth || '1 month'}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: user.lastWatchedClass ? "#2563eb" : (user.currentClass === "Completed" ? "#16a34a" : "#64748b")
                    }}
                  >
                    {user.lastWatchedClass 
                      ? `Class ${user.lastWatchedClass}` 
                      : (user.currentClass && user.currentClass !== "None" 
                          ? (user.currentClass === "Completed" ? "🎉 Completed" : `Class ${user.currentClass}`) 
                          : "None")}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handlePermanentDelete(user._id, user.name)}
                      className="btn"
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        borderRadius: '0.375rem',
                        fontWeight: 600
                      }}
                    >
                      Delete Permanently
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', gap: '1rem', borderTop: '1px solid var(--border-gray)' }}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="btn"
                style={{ padding: '0.4rem 0.8rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="btn"
                style={{ padding: '0.4rem 0.8rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontWeight: 600 }}>No soft-deleted users found.</p>
        </div>
      )}
    </div>
  );
};

export default DeletedUsers;
