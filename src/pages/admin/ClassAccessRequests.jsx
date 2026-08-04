import React, { useEffect, useState } from 'react';
import {
  getAdminClassAccessRequests,
  approveClassAccessRequest,
  rejectClassAccessRequest,
  deleteClassAccessRequest,
  bulkDeleteClassAccessRequests
} from '../../services/api';
import toast from 'react-hot-toast';

const ClassAccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchRequests = async (statusFilter, query) => {
    try {
      setLoading(true);
      const statusQuery = statusFilter === 'All' ? '' : statusFilter;
      const { data } = await getAdminClassAccessRequests(statusQuery, query);
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch access requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRequests(filter, searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [filter, searchTerm]);

  useEffect(() => {
    setSelectedIds([]);
  }, [filter, searchTerm]);

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      const { data } = await approveClassAccessRequest(id);
      if (data.success) {
        toast.success("Request Approved!");
        setRequests((prev) => prev.filter((req) => req._id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      const { data } = await rejectClassAccessRequest(id);
      if (data.success) {
        toast.success("Request Rejected!");
        setRequests((prev) => prev.filter((req) => req._id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this access request?")) {
      try {
        setActionLoadingId(id);
        const { data } = await deleteClassAccessRequest(id);
        if (data.success) {
          toast.success("Request Deleted Permanently!");
          setRequests((prev) => prev.filter((req) => req._id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete request");
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(requests.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to permanently delete the selected request(s)?`)) {
      try {
        setLoading(true);
        const { data } = await bulkDeleteClassAccessRequests(selectedIds);
        if (data.success) {
          toast.success(data.message || "Selected requests deleted permanently!");
          setRequests((prev) => prev.filter((req) => !selectedIds.includes(req._id)));
          setSelectedIds([]);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete selected requests");
      } finally {
        setLoading(false);
      }
    }
  };

  const format12HourDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  const getLastWatchedClassDisplay = (user) => {
    if (!user) return 'Not Started';

    const lastClass = user.lastWatchedClass;
    const watchedVideos = user.watchedVideos || [];

    if (lastClass === 0 || ((lastClass === null || lastClass === undefined) && watchedVideos.length > 0)) {
      return 'Intro Class';
    }

    if (lastClass !== null && lastClass !== undefined && !isNaN(Number(lastClass)) && Number(lastClass) > 0) {
      return `Class ${lastClass}`;
    }

    return 'Not Started';
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') {
      return (
        <span style={{
          background: '#dcfce7',
          color: '#15803d',
          padding: '4px 12px',
          borderRadius: '100px',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          Approved
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span style={{
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '4px 12px',
          borderRadius: '100px',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          Rejected
        </span>
      );
    }
    return (
      <span style={{
        background: '#fef3c7',
        color: '#b45309',
        padding: '4px 12px',
        borderRadius: '100px',
        fontSize: '0.8rem',
        fontWeight: 700
      }}>
        Pending
      </span>
    );
  };

  const showCheckbox = filter === 'Approved' || filter === 'Rejected';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="dashboard-title" style={{ margin: 0 }}>Class Access Requests</h1>
        
        {/* Filter Buttons & Bulk Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {showCheckbox && selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Pending', 'Approved', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: filter === tab ? '#2563eb' : '#ffffff',
                  color: filter === tab ? '#ffffff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Search Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search by Student Name or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 40px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              background: '#ffffff',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '1rem',
            pointerEvents: 'none'
          }}>
            🔍
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="course-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '2rem' }}>
            Loading requests...
          </p>
        ) : requests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-gray)' }}>
              <thead style={{ background: 'var(--secondary)', color: 'white' }}>
                <tr>
                  {showCheckbox && (
                    <th style={{ padding: '0.85rem 1rem', width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={requests.length > 0 && selectedIds.length === requests.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                        title="Select All"
                      />
                    </th>
                  )}
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student Name</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student Email</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Course</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Last Watched Class</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Requested Class</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Requested On</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                    {showCheckbox && (
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(req._id)}
                          onChange={() => handleSelectRow(req._id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                      </td>
                    )}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {req.userId?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-gray)' }}>
                      {req.userId?.email || 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>
                      {req.courseId?.title || 'Course'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.825rem',
                        fontWeight: 600
                      }}>
                        {getLastWatchedClassDisplay(req.userId)}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#2563eb' }}>
                      {req.classNumber}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getStatusBadge(req.status)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                      {format12HourDateTime(req.requestedAt)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleApprove(req._id)}
                            disabled={actionLoadingId === req._id}
                            style={{
                              background: '#16a34a',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: actionLoadingId === req._id ? 'wait' : 'pointer'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={actionLoadingId === req._id}
                            style={{
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: actionLoadingId === req._id ? 'wait' : 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(req._id)}
                          disabled={actionLoadingId === req._id}
                          style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: actionLoadingId === req._id ? 'wait' : 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
            <p style={{ fontSize: '1.15rem', color: '#475569', fontWeight: 600, margin: 0 }}>
              No class access requests found.
            </p>
            {searchTerm && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                No results matching "{searchTerm}". Try clearing or searching another name or email.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassAccessRequests;
