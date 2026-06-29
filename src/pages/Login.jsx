import React, { useState } from 'react';
import { login, adminLogin } from '../services/api';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine which API to call based on the email entered
      const isAdmin = formData.email === "admin@gmail.com";
      const apiCall = isAdmin ? adminLogin : login;

      const { data } = await apiCall(formData);

      if (data.success) {
        toast.success(data.message);

        // Update Redux state with user info and courses
        dispatch(loginSuccess({
          user: data.user,
          token: data.token,
          courses: data.courses || []
        }));

        // Redirect based on the role returned by the backend
        if (data.user.role === "admin") {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to your account</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="form-input"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="form-input"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
