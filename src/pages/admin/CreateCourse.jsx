import React, { useState } from 'react';
import { createCourse } from '../../services/api';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',   
    duration: '',
    month: '',
    videoUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        month: Number(formData.month)
      };
      
      const { data } = await createCourse(payload);
      toast.success(data.message);
      setFormData({
        title: '',
        description: '',      
        duration: '',
        month: '',
        videoUrl: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: 'auto', paddingTop: '3rem' }}>
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2 className="auth-title">Create New Course</h2>
        <p className="auth-subtitle">Fill in course details</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input
              className="form-input"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              style={{ minHeight: '100px' }}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
           <label className="form-label">Instructor</label>
           <p>Anjali Gupta</p>
          </div>
          <div className="form-group">
            <label className="form-label">Language</label>
            <p>English , Hindi</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
