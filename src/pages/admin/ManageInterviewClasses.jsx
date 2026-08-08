import React, { useEffect, useState } from 'react';
import {
  getAdminInterviewClasses,
  createInterviewClass,
  updateInterviewClass,
  deleteInterviewClass,
  getAdminInterviewAccessRequests,
  approveInterviewAccessRequest,
  rejectInterviewAccessRequest
} from '../../services/api';
import toast from 'react-hot-toast';

const ManageInterviewClasses = () => {
  const [interviewClasses, setInterviewClasses] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    order: 0
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await getAdminInterviewClasses();
      setInterviewClasses(data.interviewClasses || []);
    } catch (error) {
      console.error("Failed to fetch interview classes:", error);
      toast.error("Failed to load interview classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      setRequestsLoading(true);
      const { data } = await getAdminInterviewAccessRequests();
      setAccessRequests(data.requests || []);
    } catch (error) {
      console.error("Failed to fetch interview access requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAccessRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        const { data } = await updateInterviewClass(editingId, formData);
        toast.success(data.message || "Interview Class updated!");
      } else {
        const { data } = await createInterviewClass(formData);
        toast.success(data.message || "Interview Class created!");
      }

      setFormData({ title: '', description: '', videoUrl: '', order: 0 });
      setEditingId(null);
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save interview class");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      videoUrl: item.videoUrl || '',
      order: item.order || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', videoUrl: '', order: 0 });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Interview Class?")) {
      try {
        const { data } = await deleteInterviewClass(id);
        toast.success(data.message || "Interview Class deleted!");
        fetchClasses();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete interview class");
      }
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      const { data } = await approveInterviewAccessRequest(id);
      toast.success(data.message || "Interview access approved!");
      fetchAccessRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const { data } = await rejectInterviewAccessRequest(id);
      toast.success(data.message || "Interview access request rejected!");
      fetchAccessRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  };

  const pendingRequests = accessRequests.filter(r => r.status === 'Pending');

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <h1 className="dashboard-title" style={{ marginBottom: '1.5rem' }}>
        Manage Interview Classes & Access Requests
      </h1>

      {/* SECTION 1: Access Requests */}
      <div className="course-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 className="course-title" style={{ fontSize: '1.25rem', margin: 0 }}>
              Interview Class Access Requests
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Approve or reject student access requests for Interview Classes.
            </p>
          </div>
          {pendingRequests.length > 0 && (
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700 }}>
              ⏳ {pendingRequests.length} Pending
            </span>
          )}
        </div>

        {requestsLoading ? (
          <p style={{ color: '#64748b' }}>Loading Access Requests...</p>
        ) : accessRequests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <thead style={{ background: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>User Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Requested Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {accessRequests.map((reqItem) => (
                  <tr key={reqItem._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                      {reqItem.userName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                      {reqItem.userEmail}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(reqItem.createdAt || reqItem.requestedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        background: reqItem.status === 'Approved' ? '#dcfce7' : (reqItem.status === 'Pending' ? '#fef3c7' : '#fee2e2'),
                        color: reqItem.status === 'Approved' ? '#15803d' : (reqItem.status === 'Pending' ? '#b45309' : '#b91c1c'),
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '100px'
                      }}>
                        {reqItem.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {reqItem.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleApproveRequest(reqItem._id)}
                            className="btn"
                            style={{ background: '#16a34a', color: 'white', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto', borderRadius: '4px' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(reqItem._id)}
                            className="btn"
                            style={{ background: '#dc2626', color: 'white', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto', borderRadius: '4px' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', margin: 0 }}>No Interview Class access requests found.</p>
        )}
      </div>

      {/* SECTION 2: Video Management */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Form Card */}
        <div className="auth-card" style={{ maxWidth: '100%', margin: 0, height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: '#0f172a' }}>
            {editingId ? 'Edit Interview Class' : '+ Add New Interview Class'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Upload/manage interview preparation videos.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Flight Attendant Interview Q&A"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                style={{ minHeight: '90px' }}
                placeholder="Brief description of the interview session..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">YouTube Video URL *</label>
              <input
                type="url"
                className="form-input"
                required
                placeholder="https://youtu.be/..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ flex: 1 }}>
                {formLoading ? 'Saving...' : (editingId ? 'Update Class' : 'Add Class')}
              </button>

              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn" style={{ background: '#cbd5e1', color: '#334155' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Classes Table */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Interview Videos ({interviewClasses.length})
          </h2>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading Interview Classes...</p>
          ) : interviewClasses.length > 0 ? (
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#1e293b', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Order</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Title</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Video URL</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviewClasses.map((item, idx) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.9rem', color: '#7c3aed' }}>
                        #{item.order !== undefined ? item.order : idx + 1}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                        {item.title}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#2563eb', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.videoUrl}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn"
                            style={{ background: '#2563eb', color: 'white', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="btn"
                            style={{ background: '#dc2626', color: 'white', padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2.5rem', background: '#f8fafc', borderRadius: '0.75rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>No Interview Classes added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageInterviewClasses;
