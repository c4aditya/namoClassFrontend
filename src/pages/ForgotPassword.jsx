import React, { useState } from 'react';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await forgotPassword({ email });
      if (data.success) {
        toast.success(data.message || 'Email verified successfully');
        navigate('/reset-password', { state: { email } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'User with this email does not exist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your registered email address to continue</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>

        <p className="text-center mt-4">
          Remember your password?{' '}
          <Link to="/login" className="text-primary link">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
