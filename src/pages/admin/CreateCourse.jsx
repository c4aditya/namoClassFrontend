import React, { useState, useEffect } from 'react';
import { createCourse, getAdminAllCourses, updateCourse } from '../../services/api';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacherName: 'Anjali Gupta',
    languageMedium: 'English, Hindi',
    duration: '',
    month: '',
    videoUrl: '',
    classSequence: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      let res;
      try {
        res = await getAdminAllCourses();
      } catch (errPrimary) {
        console.warn("Primary admin courses fetch failed, trying alternate route...", errPrimary);
        try {
          const { default: API } = await import('../../services/api');
          res = await API.get('/courses/admin/courses');
        } catch (errAlt) {
          console.error("Alternate fetch failed:", errAlt);
        }
      }
      if (res?.data?.success) {
        setCourses(res.data.courses || []);
      }
    } catch (error) {
      console.error("Failed to fetch admin courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      teacherName: course.teacherName || 'Anjali Gupta',
      languageMedium: course.languageMedium || 'English, Hindi',
      duration: course.duration || '',
      month: String(course.month || ''),
      videoUrl: course.videoUrl || '',
      classSequence: course.globalIndex !== undefined ? String(course.globalIndex) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      teacherName: 'Anjali Gupta',
      languageMedium: 'English, Hindi',
      duration: '',
      month: '',
      videoUrl: '',
      classSequence: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        month: Number(formData.month),
        ...(formData.classSequence !== '' ? { targetSequence: Number(formData.classSequence) } : {})
      };

      if (editingCourse) {
        const { data } = await updateCourse(editingCourse._id, payload);
        toast.success(data.message || "Course updated successfully!");
        setEditingCourse(null);
      } else {
        const { data } = await createCourse(payload);
        toast.success(data.message || "Course created successfully!");
      }

      setFormData({
        title: '',
        description: '',
        teacherName: 'Anjali Gupta',
        languageMedium: 'English, Hindi',
        duration: '',
        month: '',
        videoUrl: '',
        classSequence: ''
      });
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || (editingCourse ? "Failed to update course" : "Failed to create course"));
    } finally {
      setLoading(false);
    }
  };

  const getClassLabel = (c) => {
    if (c.globalIndex === 0) return "Intro Class";
    if (c.globalIndex !== undefined && c.globalIndex !== null) return `Class ${c.globalIndex}`;
    return "Class";
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="auth-container" style={{ minHeight: 'auto', paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div className="auth-card" style={{ maxWidth: '640px', width: '100%' }}>
          <h2 className="auth-title">
            {editingCourse ? '✏️ Edit Existing Class' : 'Create New Class / Course'}
          </h2>
          <p className="auth-subtitle">
            {editingCourse ? `Editing details for ${getClassLabel(editingCourse)} (${editingCourse.title})` : 'Fill in class details below'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Class Title</label>
              <input
                className="form-input"
                type="text"
                required
                placeholder="e.g. Navigation & Flight Planning"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                style={{ minHeight: '90px' }}
                required
                placeholder="Class overview and topics covered..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Instructor</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={formData.languageMedium}
                  onChange={(e) => setFormData({ ...formData, languageMedium: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Plan Duration</label>
                <select
                  className="form-input"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="">Select Duration</option>
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Course Level (Month)</label>
                <select
                  className="form-input"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                >
                  <option value="">Select Month</option>
                  <option value="1">Month 1</option>
                  <option value="2">Month 2</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Class Sequence #</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 33"
                  value={formData.classSequence}
                  onChange={(e) => setFormData({ ...formData, classSequence: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">YouTube Video URL</label>
              <input
                className="form-input"
                type="url"
                required
                placeholder="https://youtu.be/..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                {loading
                  ? (editingCourse ? 'Updating...' : 'Creating...')
                  : (editingCourse ? '💾 Save / Update Class' : 'Create Course')}
              </button>

              {editingCourse && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn"
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '0.75rem 1.25rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    borderRadius: '0.5rem'
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Directory of Existing Classes with Edit Action */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            📚 All Existing Classes ({courses.length})
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Click "Edit Class" to pre-fill details in the form above and save changes.
          </span>
        </div>

        {loadingCourses ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading classes...</p>
        ) : courses.length > 0 ? (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-gray)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--secondary)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Sequence #</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Duration</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Month Level</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Video URL</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => {
                  const isBeingEdited = editingCourse?._id === c._id;
                  return (
                    <tr
                      key={c._id}
                      style={{
                        borderBottom: '1px solid var(--border-gray)',
                        backgroundColor: isBeingEdited ? '#eff6ff' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                        {getClassLabel(c)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {c.title}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
                        {c.duration === '1' ? '1 Month' : (c.duration === '2' ? '2 Months' : c.duration)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
                        Month {c.month}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        {c.videoUrl ? (
                          <a
                            href={c.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2563eb', textDecoration: 'underline' }}
                          >
                            View Link ↗
                          </a>
                        ) : 'N/A'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditClick(c)}
                          style={{
                            background: isBeingEdited ? '#16a34a' : '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.85rem',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {isBeingEdited ? 'Editing...' : '✏️ Edit Class'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', padding: '1rem 0' }}>No classes found.</p>
        )}
      </div>
    </div>
  );
};

export default CreateCourse;
