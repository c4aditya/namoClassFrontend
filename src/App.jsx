import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/authSlice';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingUsers from './pages/admin/PendingUsers';
import ApproveUsers from './pages/admin/ApproveUsers';
import CreateCourse from './pages/admin/CreateCourse';
import AddUser from './pages/admin/AddUser';
import ViewUsers from './pages/admin/ViewUsers';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, role } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (loading) {
    return <div className="auth-container"><h1>Loading...</h1></div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <main className="transition-all duration-300">
          <Routes>
            <Route path="/" element={
              isAuthenticated 
                ? (role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)
                : <Navigate to="/login" />
            } />
            <Route path="/login" element={
              isAuthenticated 
                ? (role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)
                : <Login />
            } />
            <Route path="/signup" element={<Signup />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              isAuthenticated && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
            } />
            <Route path="/admin/pending-users" element={
              isAuthenticated && role === 'admin' ? <PendingUsers /> : <Navigate to="/login" />
            } />
            <Route path="/admin/approve-users" element={
              isAuthenticated && role === 'admin' ? <ApproveUsers /> : <Navigate to="/login" />
            } />
            <Route path="/admin/create-course" element={
              isAuthenticated && role === 'admin' ? <CreateCourse /> : <Navigate to="/login" />
            } />
            <Route path="/admin/add-user" element={
              isAuthenticated && role === 'admin' ? <AddUser /> : <Navigate to="/login" />
            } />
            <Route path="/admin/view-users" element={
              isAuthenticated && role === 'admin' ? <ViewUsers /> : <Navigate to="/login" />
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="py-8 text-center text-gray-400 text-sm border-t mt-auto">
          &copy; {new Date().getFullYear()} Aviation Class. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
