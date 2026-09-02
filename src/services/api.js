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
export const getAdminAllCourses = () => API.get('/courses/admin/courses');
export const updateCourse = (id, formData) => API.put(`/courses/admin/course/${id}`, formData);
export const addUser = (formData) => API.post('/auth/add-user', formData);
export const getAllUsers = () => API.get('/auth/users');
export const updateUserDuration = (id, enrolledMonth) => API.put(`/auth/update-duration/${id}`, { enrolledMonth });
export const adminUpdateUser = (id, userData) => API.put(`/auth/update-user/${id}`, userData);
export const deleteUser = (id) => API.delete(`/auth/delete-user/${id}`);

// ✅ Pause / Resume All Classes
export const pauseResumeCourses = (isPaused) =>
    API.patch('/courses/pause-courses', { isPaused });

export const getCoursePauseStatus = () =>
    API.get('/courses/pause-courses');

// ✅ Per Class Access Requests (Student & Admin)
export const requestClassAccess = (data) => API.post('/request-class-access', data);
export const getClassAccessStatus = (classId) => API.get(`/class-access-status/${classId}`);
export const getAllClassAccessStatuses = () => API.get('/class-access-statuses');
export const getAdminClassAccessRequests = (status, search) => API.get('/admin/class-access-requests', { params: { ...(status ? { status } : {}), ...(search ? { search } : {}) } });
export const approveClassAccessRequest = (id) => API.patch(`/admin/class-access-request/${id}/approve`);
export const rejectClassAccessRequest = (id) => API.patch(`/admin/class-access-request/${id}/reject`);
export const deleteClassAccessRequest = (id) => API.delete(`/admin/class-access-request/${id}`);
export const bulkDeleteClassAccessRequests = (ids) => API.post('/admin/class-access-requests/bulk-delete', { ids });

// Course APIs
export const getCourses = () => API.get('/courses/courses');
export const getFilteredCourses = (month) => API.get('/courses/filter', { params: { month } });
export const getVideosFilter = (month) => API.get('/videos/filter', { params: { month } });
export const trackProgress = (courseId, classNumber) => API.post(`/courses/progress/${courseId}`, { classNumber });

export default API;