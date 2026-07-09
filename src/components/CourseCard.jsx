import React, { useState, useEffect, useMemo, useRef } from "react";
import {Plyr} from "plyr-react";
import "plyr-react/plyr.css";
import { trackProgress } from "../services/api";

const CourseCard = ({ course, isLocked: initialIsLocked, unlockTime }) => {
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [timeLeft, setTimeLeft] = useState(() => unlockTime - Date.now());
  const plyrRef = useRef(null);

  useEffect(() => {
    setIsLocked(Date.now() < unlockTime);
    setTimeLeft(unlockTime - Date.now());

    const interval = setInterval(() => {
      const remaining = unlockTime - Date.now();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setIsLocked(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockTime]);

  const getVideoId = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const videoId = course?.videoUrl ? getVideoId(course.videoUrl) : "";

  // useEffect(() => {
  //   if (isLocked || !videoId) return;

  //   const plyrInstance = plyrRef.current?.plyr;
  //   if (!plyrInstance) return;



  //   // Use Plyr's event API if available
  //   if (typeof plyrInstance.on === "function") {
  //     plyrInstance.on('play', handlePlay);
  //     return () => {
  //       plyrInstance.off('play', handlePlay);
  //     };
  //   }

  //   // Fallback to native video element event listeners
  //   const videoEl = plyrInstance?.media?.target || plyrInstance?.element;
  //   if (videoEl && typeof videoEl.addEventListener === "function") {
  //     videoEl.addEventListener('play', handlePlay);
  //     return () => {
  //       videoEl.removeEventListener('play', handlePlay);
  //     };
  //   }
  // }, [videoId, course._id, isLocked]);

  const handlePlay = async () => {
    console.log("Video Started");

    try {
      const res = await trackProgress(course._id);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        const player = plyrRef.current?.plyr;

        if (!player) {
            console.log("Player not ready");
            return;
        }

        console.log("Player Ready");

        player.on("play", handlePlay);

        return () => {
            player.off("play", handlePlay);
        };
    }, 1000);

    return () => clearTimeout(timer);
}, []);


  const formatTime = (ms) => {
    if (ms <= 0) return "";
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (isLocked) {
    return (
      <div className="course-card" style={{ opacity: 0.8, filter: 'grayscale(0.2)' }}>
        <div className="video-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e293b',
          height: '225px'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Available Soon</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, padding: '0 1rem' }}>
              Unlocks in {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        <div className="course-info">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
            <h3 className="course-title" style={{ color: '#64748b' }}>{course?.title}</h3>
            <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", fontWeight: 600 }}>
              Month {course?.duration || course?.month}
            </span>
          </div>
          <p className="course-desc" style={{ color: '#94a3b8' }}>{course?.description}</p>
        </div>
      </div>
    );
  }



  const plyrSource = useMemo(() => ({
    type: "video",
    sources: [
      {
        src: videoId,
        provider: "youtube",
      },
    ],
  }), [videoId]);

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
      noCookie: true,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1
    }
  }), []);

  return (
    <div className="course-card">
      <div className="video-container" style={{ position: 'relative' }}>
        {videoId ? (
          <>
            <Plyr
              source={plyrSource}
              options={plyrOptions}
              ref={plyrRef}
              key={videoId}
              onPlay={handlePlay}
            />
            {/* Transparent overlay to block clicks on YouTube title/channel/share */}
            <div className="video-protection-overlay"></div>
          </>
        ) : (
          <div style={{
            height: '225px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            borderRadius: '8px'
          }}>
            <p style={{ color: "red" }}>Invalid or locked video URL</p>
          </div>
        )}
      </div>

      <div className="course-info">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <h3 className="course-title">{course?.title}</h3>

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

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
          <p style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 600 }}>
            🔓 Video Unlocked & Playable
          </p>
        </div>

        <div className="course-meta">
          <p>

          </p>
          <p>
            <strong>Language:</strong> English , Hindi
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;