import React, { useState } from 'react';
import { addUser } from '../../services/api';
import toast from 'react-hot-toast';

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enrolledMonth: '1 month'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await addUser(formData);
      toast.success(data.message);
      setFormData({
        name: '',
        email: '',
        phone: '',
        enrolledMonth: '1 month'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: 'auto', paddingTop: '3rem' }}>
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2 className="auth-title">Pre-approve User</h2>
        <p className="auth-subtitle">Allow specific emails to signup</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input" 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-input" 
              type="text" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Enrolled For</label>
            <select 
              className="form-input" 
              value={formData.enrolledMonth}
              onChange={(e) => setFormData({...formData, enrolledMonth: e.target.value})}
            >
              <option value="1 month">1 Month</option>
              <option value="2 months">2 Months</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
