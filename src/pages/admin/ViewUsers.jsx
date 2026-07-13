import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserDuration, deleteUser } from '../../services/api';
import toast from 'react-hot-toast';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
      setTotalEnrolled(data.totalEnrolledStudents);
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

  const handleDurationChange = async (userId, newDuration) => {
    try {
      const { data } = await updateUserDuration(userId, newDuration);
      toast.success(data.message);
      fetchUsers(); // Refresh list to reflect updated data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update duration");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user? This will also remove their pre-approved email access.")) {
      try {
        const { data } = await deleteUser(userId);
        toast.success(data.message);
        fetchUsers(); // Refresh list
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  // Filtered Users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      <h1 className="dashboard-title">Total Users Directory</h1>

      {/* Stats Summary cards */}
      <div className="course-grid" style={{ marginTop: '2rem', marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.9 }}>Total Registered Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalUsers}</p>
        </div>
        <div style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.9 }}>Total Enrolled Students</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalEnrolled}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="form-input"
          style={{ maxWidth: '400px', padding: '0.6rem 1rem' }}
        />
        <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
          Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
        </div>
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
                <th style={{ padding: '1rem', textAlign: 'left' }}>Signup Date</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Course Duration</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Progress Count</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Current Class</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Completed</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-gray)' }}>{user.email}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>                  </td>
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
                      color: 'var(--primary)'
                    }}
                  >
                    {user.watchedVideos ? user.watchedVideos.length : 0} videos
                  </td>

                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: user.currentClass === "Completed" ? "#16a34a" : "#2563eb"
                    }}
                  >
                    {user.currentClass === "Completed"
                      ? "🎉 Completed"
                      : `Class ${user.currentClass}`}
                  </td>

                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    {user.completedClasses} / {user.totalCourses}
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'center' }}>
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
    </div>
  );
};

export default ViewUsers;
