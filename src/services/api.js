import axios from 'axios';

const API = axios.create({
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://api.aviation-courses.com/api',
    withCredentials: true // Important for cookies
});

// Auth APIs
export const signup = (formData) => API.post('/auth/signup', formData);
export const login = (formData) => API.post('/auth/login', formData);
export const adminLogin = (formData) => API.post('/auth/admin-login', formData);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getMe = () => API.get('/auth/me');
export const logoutUser = () => API.post('/auth/logout');


// Admin APIs
export const getAdminStats = () => API.get('/auth/stats');
export const getPendingUsers = () => API.get('/auth/pending-users');
export const getApprovedPendingLoginUsers = () => API.get('/auth/approved-pending-login');
export const approveUser = (id) => API.put(`/auth/approve/${id}`);
export const createCourse = (formData) => API.post('/courses/create-course', formData);
export const addUser = (formData) => API.post('/auth/add-user', formData);
export const getAllUsers = () => API.get('/auth/users');
export const updateUserDuration = (id, enrolledMonth) => API.put(`/auth/update-duration/${id}`, { enrolledMonth });
export const deleteUser = (id) => API.delete(`/auth/delete-user/${id}`);

// ✅ Pause / Resume All Classes
export const pauseResumeCourses = (isPaused) =>
    API.patch('/courses/pause-courses', { isPaused });

export const getCoursePauseStatus = () =>
    API.get('/courses/pause-courses');


// Course APIs
export const getCourses = () => API.get('/courses/courses');
export const trackProgress = (courseId) => API.post(`/courses/progress/${courseId}`);

export default API;