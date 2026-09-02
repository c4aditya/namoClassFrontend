import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plyr } from "plyr-react";
import "plyr-react/plyr.css";
import { trackProgress, requestClassAccess, getClassAccessStatus } from "../services/api";
import { FaRegStar } from "react-icons/fa6";
import toast from "react-hot-toast";

class VideoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("Video Player caught non-fatal DOM error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '225px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Loading video player...</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const CourseCard = ({ course, isLocked: initialIsLocked, unlockTime, index, isNextClass: propIsNextClass, isFutureLocked: propIsFutureLocked, overrideLabel }) => {
  const isIntro = course?.isIntro !== undefined
    ? course.isIntro
    : (index === 0 && String(course?.duration || '').trim() !== '2' && String(course?.duration || '').trim() !== '2 month' && String(course?.duration || '').trim() !== '2 months');
  const displayClassLabel = overrideLabel || (isIntro ? "Intro Class" : `Class ${index}`);

  const isFutureLocked = propIsFutureLocked !== undefined ? propIsFutureLocked : course?.isFutureLocked;
  const isNextClass = propIsNextClass !== undefined ? propIsNextClass : course?.isNextClass;

  const [accessStatus, setAccessStatus] = useState(
    isIntro ? 'Approved' : (course?.accessStatus || 'Not Requested')
  );
  const [requestLoading, setRequestLoading] = useState(false);
  const plyrRef = useRef(null);

  const nextGrantAccessTime = course?.nextGrantAccessTime;
  const [delayTimeLeft, setDelayTimeLeft] = useState(() => {
    if (!nextGrantAccessTime) return 0;
    return Math.max(0, new Date(nextGrantAccessTime).getTime() - Date.now());
  });

  useEffect(() => {
    if (!nextGrantAccessTime) return;

    const updateDelayTimer = () => {
      const remaining = Math.max(0, new Date(nextGrantAccessTime).getTime() - Date.now());
      setDelayTimeLeft(remaining);
    };

    updateDelayTimer();
    const interval = setInterval(updateDelayTimer, 1000);
    return () => clearInterval(interval);
  }, [nextGrantAccessTime]);

  const formatDelayTime = (ms) => {
    if (ms <= 0) return "";
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  };

  useEffect(() => {
    if (course?.accessStatus) {
      setAccessStatus(course.accessStatus);
    } else if (!isIntro) {
      getClassAccessStatus(course._id)
        .then((res) => {
          if (res.data?.success && res.data?.status) {
            setAccessStatus(res.data.status);
          }
        })
        .catch(() => {});
    }
  }, [course._id, isIntro, course?.accessStatus]);

  const parseVideoSource = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { type: 'invalid', message: 'No video URL provided' };
    }

    let cleaned = rawUrl.trim();

    // 1. If HTML iframe string passed, extract src attribute
    if (cleaned.includes('<iframe')) {
      const srcMatch = cleaned.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        cleaned = srcMatch[1].trim();
      }
    }

    // 2. Check if standalone 11-char YouTube ID (e.g., "dQw4w9WgXcQ")
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
      return {
        type: 'youtube',
        videoId: cleaned,
        embedUrl: `https://www.youtube.com/embed/${cleaned}`
      };
    }

    // 3. Check YouTube URL patterns (watch?v=, youtu.be/, embed/, shorts/, live/)
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const ytMatch = cleaned.match(ytRegex);
    if (ytMatch && ytMatch[1] && ytMatch[1].length === 11) {
      return {
        type: 'youtube',
        videoId: ytMatch[1],
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`
      };
    }

    // 4. Check for direct HTTP/HTTPS video URL
    if (/^https?:\/\//i.test(cleaned)) {
      return {
        type: 'html5',
        url: cleaned
      };
    }

    return { type: 'invalid', message: 'Invalid video URL format' };
  };

  const videoSourceInfo = useMemo(() => {
    return parseVideoSource(course?.videoUrl);
  }, [course?.videoUrl]);

  const handlePlay = async () => {
    try {
      const res = await trackProgress(course._id, isIntro ? 0 : index);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (accessStatus !== 'Approved') return;

    let playerInstance = null;
    const timer = setTimeout(() => {
      playerInstance = plyrRef.current?.plyr;
      if (playerInstance) {
        try {
          playerInstance.on("play", handlePlay);
        } catch (e) {}
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (playerInstance) {
        try {
          playerInstance.off("play", handlePlay);
        } catch (e) {}
      }
    };
  }, [accessStatus]);

  const handleRequestAccessSubmit = async () => {
    try {
      setRequestLoading(true);
      const res = await requestClassAccess({
        courseId: course._id,
        classId: course._id,
        classNumber: displayClassLabel
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Class access requested!");
        setAccessStatus('Pending');
      } else {
        toast.error(res.data?.message || "Failed to request access");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to request access";
      toast.error(msg);
      if (err.response?.data?.status) {
        setAccessStatus(err.response.data.status);
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const plyrSource = useMemo(() => {
    if (videoSourceInfo.type === 'youtube' && videoSourceInfo.videoId) {
      return {
        type: "video",
        sources: [
          {
            src: videoSourceInfo.videoId,
            provider: "youtube",
          },
        ],
      };
    }
    if (videoSourceInfo.type === 'html5' && videoSourceInfo.url) {
      return {
        type: "video",
        sources: [
          {
            src: videoSourceInfo.url,
            type: videoSourceInfo.url.endsWith('.webm') ? 'video/webm' : 'video/mp4'
          },
        ],
      };
    }
    return null;
  }, [videoSourceInfo]);

  const plyrOptions = useMemo(() => ({
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'captions',
      'settings',
      'pip',
      'airplay',
      'fullscreen'
    ],
    settings: ['captions', 'quality', 'speed'],
    youtube: {
      noCookie: false,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1
    }
  }), []);

  // Render Video or Request Container based on accessStatus
  const renderVideoOrAccessControl = () => {
    // Intro class or Approved class -> show Video Player
    if (isIntro || accessStatus === 'Approved') {
      return (
        <div className="video-container" style={{ position: 'relative' }}>
          {plyrSource ? (
            <VideoErrorBoundary key={course?._id || videoSourceInfo.videoId || videoSourceInfo.url}>
              <Plyr
                source={plyrSource}
                options={plyrOptions}
                ref={plyrRef}
                key={videoSourceInfo.videoId || videoSourceInfo.url}
                onPlay={handlePlay}
              />
              <div className="video-protection-overlay"></div>
            </VideoErrorBoundary>
          ) : (
            <div style={{
              height: '225px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>
                Video Unavailable
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                The video link for this class is invalid or missing.
              </p>
            </div>
          )}
        </div>
      );
    }

    // Future Locked State (after immediate next class)
    if (isFutureLocked) {
      return (
        <div className="video-container" style={{
          height: '225px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          opacity: 0.85
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.25rem' }}>
            Locked
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Complete the previous class to request access.
          </p>
        </div>
      );
    }

    // Pending State
    if (accessStatus === 'Pending') {
      return (
        <div className="video-container" style={{
          height: '225px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.25rem' }}>
            Waiting for Admin Approval
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Your request to watch this class has been sent to the admin.
          </p>
        </div>
      );
    }

    // Rejected State
    if (accessStatus === 'Rejected') {
      return (
        <div className="video-container" style={{
          height: '225px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e1b1e',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❌</div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
            Access Request Rejected
          </h4>
          <button
            onClick={handleRequestAccessSubmit}
            disabled={requestLoading}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: requestLoading ? 'wait' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {requestLoading ? 'Requesting...' : 'Grant Access'}
          </button>
        </div>
      );
    }

    // Not Requested State (Immediate Next Class)
    if (delayTimeLeft > 0) {
      return (
        <div className="video-container" style={{
          height: '225px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e293b',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.35rem' }}>🔒</div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem', color: '#e2e8f0' }}>
            Approval Required to Watch
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.65rem', lineHeight: 1.4, padding: '0 0.5rem' }}>
            ⏳ Grant Access will be available 12 hours after your last approved class.
          </p>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fef3c7',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '5px 14px',
            borderRadius: '20px'
          }}>
            Available in: {formatDelayTime(delayTimeLeft)}
          </div>
        </div>
      );
    }

    return (
      <div className="video-container" style={{
        height: '225px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e293b',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>
          Approval Required to Watch
        </h4>
        <button
          onClick={handleRequestAccessSubmit}
          disabled={requestLoading}
          style={{
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: requestLoading ? 'wait' : 'pointer',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)'
          }}
        >
          {requestLoading ? 'Submitting...' : 'Grant Access'}
        </button>
      </div>
    );
  };

  return (
    <div className="course-card">
      {renderVideoOrAccessControl()}

      <div className="course-info">
        <div
          style={{
            display: "flex",
            justify: "space-between",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          {!displayClassLabel?.startsWith("Class ") && (
            <span
              style={{
                background: overrideLabel ? "#7c3aed" : (isIntro ? "#16a34a" : "#2563eb"),
                color: "#ffffff",
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "6px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {displayClassLabel}
            </span>
          )}
          <h3 className="course-title" style={{ flex: 1 }}>{course?.title}</h3>

          <span
            style={{
              background: "#dbeafe",
              color: "#1e40af",
              fontSize: "0.75rem",
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Month {course?.duration || course?.month}
          </span>
        </div>

        <p className="course-desc">{course?.description}</p>

        {/* Access Status Banner below course description */}
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem" }}>
          {isIntro ? (
            <p style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 600 }}>
              🔓 Intro Class (No Approval Needed)
            </p>
          ) : accessStatus === 'Approved' ? (
            <p style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 600 }}>
              ▶ Play Class (Access Approved)
            </p>
          ) : isFutureLocked ? (
            <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
              🔒 Locked
            </p>
          ) : accessStatus === 'Pending' ? (
            <p style={{ color: "#d97706", fontSize: "0.85rem", fontWeight: 600 }}>
              ⏳ Waiting for Admin Approval
            </p>
          ) : accessStatus === 'Rejected' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: "#dc2626", fontSize: "0.85rem", fontWeight: 600 }}>
                ❌ Access Request Rejected
              </p>
              <button
                onClick={handleRequestAccessSubmit}
                disabled={requestLoading}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: requestLoading ? 'wait' : 'pointer'
                }}
              >
                Grant Access
              </button>
            </div>
          ) : delayTimeLeft > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: "#d97706", fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>
                ⏳ Available in: {formatDelayTime(delayTimeLeft)}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>
                🔒 Approval Required
              </p>
              <button
                onClick={handleRequestAccessSubmit}
                disabled={requestLoading}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: requestLoading ? 'wait' : 'pointer'
                }}
              >
                Grant Access
              </button>
            </div>
          )}
        </div>

        <div className="course-meta">
          <p>
            <strong>Language :</strong> English , Hindi
          </p>
          <p>
            <strong>Rating : </strong> 4 <FaRegStar />
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;