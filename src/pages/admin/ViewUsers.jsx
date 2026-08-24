import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserDuration, deleteUser, adminUpdateUser } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('All'); // 'All', '1 Month', '2 Months'
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const location = useLocation();

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    enrolledMonth: '1 month',
    lastWatchedClass: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data.users || []);
      setTotalUsers(data.totalUsers || 0);
      setTotalEnrolled(data.totalEnrolledStudents || 0);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const is1MonthUser = (u) => {
    const s = String(u.enrolledMonth || '').toLowerCase().trim();
    return s === '1' || s === '1 month' || s.startsWith('1');
  };

  const is2MonthUser = (u) => {
    const s = String(u.enrolledMonth || '').toLowerCase().trim();
    return s === '2' || s === '2 month' || s === '2 months' || s.startsWith('2');
  };

  const formatLastApprovedClass = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (val === 0 || val === '0') return 'Intro Class';
    if (typeof val === 'number' || (/^\d+$/).test(String(val).trim())) {
      return `Class ${val}`;
    }
    return String(val);
  };

  const count1Month = users.filter(is1MonthUser).length;
  const count2Month = users.filter(is2MonthUser).length;

  const getLastWatchedDisplay = (u) => {
    if (u.lastWatchedClass === 0) return "Intro Class";
    if (u.lastWatchedClass !== null && u.lastWatchedClass !== undefined && !isNaN(Number(u.lastWatchedClass)) && Number(u.lastWatchedClass) > 0) {
      return `Class ${u.lastWatchedClass}`;
    }
    if (u.currentClass && u.currentClass !== "None") {
      return u.currentClass === "Completed" ? "🎉 Completed" : `Class ${u.currentClass}`;
    }
    return "None";
  };

  const isNoClassAttempted = (u) => {
    return getLastWatchedDisplay(u) === "None";
  };

  const countNoClass = users.filter(isNoClassAttempted).length;

  const handleDurationChange = async (userId, newDuration) => {
    try {
      const { data } = await updateUserDuration(userId, newDuration);
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update duration");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user? This will also remove their pre-approved email access.")) {
      try {
        const { data } = await deleteUser(userId);
        toast.success(data.message);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      enrolledMonth: user.enrolledMonth || '1 month',
      lastWatchedClass: (user.lastWatchedClass !== null && user.lastWatchedClass !== undefined) ? String(user.lastWatchedClass) : ''
    });
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setEditLoading(true);
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        enrolledMonth: editForm.enrolledMonth,
        lastWatchedClass: editForm.lastWatchedClass !== '' ? editForm.lastWatchedClass : null
      };

      const { data } = await adminUpdateUser(editingUser._id, payload);
      toast.success(data.message || "User details updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  // Filtered Users based on search and month filter
  const filteredUsers = users.filter(user => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query));

    if (!matchesSearch) return false;

    if (monthFilter === '1 Month') return is1MonthUser(user);
    if (monthFilter === '2 Months') return is2MonthUser(user);
    if (monthFilter === 'No Class Attempted') return isNoClassAttempted(user);

    return true;
  });

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
      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <Link to="/admin/view-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/view-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/view-users' ? '#fff' : '#475569' }}>Total Users</Link>
        <Link to="/admin/approve-users" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600, background: location.pathname === '/admin/approve-users' ? 'var(--primary)' : '#f1f5f9', color: location.pathname === '/admin/approve-users' ? '#fff' : '#475569' }}>Approve Users</Link>
      </div>

      <h1 className="dashboard-title">Total Users Directory</h1>

      {/* Stats Summary cards */}
      <div className="course-grid" style={{ marginTop: '2rem', marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.9 }}>Total Registered Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalUsers}</p>
        </div>
        <div style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.9 }}>Total Enrolled Students</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalEnrolled}</p>
        </div>
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.9 }}>1 Month Students</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{count1Month}</p>
        </div>
        <div style={{ backgroundColor: '#7c3aed', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.9 }}>2 Month Students</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{count2Month}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569', marginRight: '0.25rem' }}>
            Filter:
          </span>
          <button
            onClick={() => { setMonthFilter('All'); setCurrentPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: monthFilter === 'All' ? '#2563eb' : '#ffffff',
              color: monthFilter === 'All' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => { setMonthFilter('1 Month'); setCurrentPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: monthFilter === '1 Month' ? '#2563eb' : '#ffffff',
              color: monthFilter === '1 Month' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            1 Month Students ({count1Month})
          </button>
          <button
            onClick={() => { setMonthFilter('2 Months'); setCurrentPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: monthFilter === '2 Months' ? '#2563eb' : '#ffffff',
              color: monthFilter === '2 Months' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            2 Month Students ({count2Month})
          </button>
          <button
            onClick={() => { setMonthFilter('No Class Attempted'); setCurrentPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: monthFilter === 'No Class Attempted' ? '#2563eb' : '#ffffff',
              color: monthFilter === 'No Class Attempted' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            No Class Attempted ({countNoClass})
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="form-input"
          style={{ maxWidth: '340px', padding: '0.6rem 1rem' }}
        />
      </div>

      <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Showing {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0} - {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
      </div>

      {loading ? (
        <p>Loading Users...</p>
      ) : filteredUsers.length > 0 ? (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-gray)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--secondary)', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Full Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Signup Date</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Course Duration</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Last Watched Class</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Last Approved Class</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>{user.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>{user.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={user.enrolledMonth || '1 month'}
                      onChange={(e) => handleDurationChange(user._id, e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-gray)', outline: 'none', background: 'white' }}
                    >
                      <option value="1 month">1 Month</option>
                      <option value="2 months">2 Months</option>
                    </select>
                  </td>

                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: (user.lastWatchedClass !== null && user.lastWatchedClass !== undefined) ? "#2563eb" : (user.currentClass === "Completed" ? "#16a34a" : "#64748b")
                    }}
                  >
                    {user.lastWatchedClass === 0
                      ? "Intro Class"
                      : ((user.lastWatchedClass !== null && user.lastWatchedClass !== undefined && !isNaN(Number(user.lastWatchedClass)) && Number(user.lastWatchedClass) > 0)
                          ? `Class ${user.lastWatchedClass}`
                          : (user.currentClass && user.currentClass !== "None"
                              ? (user.currentClass === "Completed" ? "🎉 Completed" : `Class ${user.currentClass}`)
                              : "None"))}
                  </td>

                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: user.lastApprovedClass ? "#2563eb" : "#64748b"
                    }}
                  >
                    {formatLastApprovedClass(user.lastApprovedClass)}
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.85rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Edit User
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="btn"
                        style={{
                          background: 'var(--error)',
                          color: 'white',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.85rem',
                          width: 'auto',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid var(--border-gray)' }}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', background: currentPage === 1 ? '#e5e7eb' : '#f3f4f6', color: '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', background: currentPage === totalPages ? '#e5e7eb' : '#f3f4f6', color: '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p style={{ marginTop: '2rem', color: 'var(--text-gray)' }}>No registered users found.</p>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                ✏️ Edit User Details
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Enrolled Month / Course Duration
                </label>
                <select
                  value={editForm.enrolledMonth}
                  onChange={(e) => setEditForm({ ...editForm, enrolledMonth: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="1 month">1 Month</option>
                  <option value="2 months">2 Months</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Last Watched Class
                </label>
                <select
                  value={editForm.lastWatchedClass}
                  onChange={(e) => setEditForm({ ...editForm, lastWatchedClass: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="">None (Not Started)</option>
                  <option value="0">Intro Class (Class 0)</option>
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={String(num)}>
                      Class {num}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: editLoading ? 'wait' : 'pointer'
                  }}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUsers;
