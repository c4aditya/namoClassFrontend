import React, { useEffect, useState } from 'react';
import { getPendingUsers, approveUser } from '../../services/api';
import toast from 'react-hot-toast';

const ApproveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
