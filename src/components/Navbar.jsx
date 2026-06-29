import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { logoutUser } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      toast.success("Logged out");
      navigate('/login');
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Aviation Class</Link>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            {role === 'admin' ? (
              <>
                <Link to="/admin/dashboard" className="nav-link">Admin Panel</Link>
                <Link to="/admin/pending-users" className="nav-link">Pending</Link>
              </>
            ) : (
              <Link to="/dashboard" className="nav-link">My Courses</Link>
            )}
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ fontWeight: 600, color: '#93c5fd' }}>{user?.name || user?.email?.split('@')[0]}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-logout"
              style={{ width: 'auto' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem', textDecoration: 'none' }}>Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
