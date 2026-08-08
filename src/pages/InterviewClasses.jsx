import React, { useEffect, useState, useMemo } from 'react';
import { getInterviewClasses } from '../services/api';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

const parseVideoSource = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'invalid', message: 'No video URL provided' };
  }
  let cleaned = rawUrl.trim();
  if (cleaned.includes('<iframe')) {
    const srcMatch = cleaned.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) cleaned = srcMatch[1].trim();
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
    return { type: 'youtube', videoId: cleaned };
  }
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = cleaned.match(ytRegex);
  if (ytMatch && ytMatch[1] && ytMatch[1].length === 11) {
    return { type: 'youtube', videoId: ytMatch[1] };
  }
  if (/^https?:\/\//i.test(cleaned)) {
    return { type: 'html5', url: cleaned };
  }
  return { type: 'invalid', message: 'Invalid video URL format' };
};

const InterviewCard = ({ item, index }) => {
  const videoInfo = useMemo(() => parseVideoSource(item?.videoUrl), [item?.videoUrl]);

  const plyrSource = useMemo(() => {
    if (videoInfo.type === 'youtube' && videoInfo.videoId) {
      return {
        type: 'video',
        sources: [{ src: videoInfo.videoId, provider: 'youtube' }]
      };
    }
    if (videoInfo.type === 'html5' && videoInfo.url) {
      return {
        type: 'video',
        sources: [{ src: videoInfo.url, type: videoInfo.url.endsWith('.webm') ? 'video/webm' : 'video/mp4' }]
      };
    }
    return null;
  }, [videoInfo]);

  const plyrOptions = useMemo(() => ({
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
    settings: ['captions', 'quality', 'speed']
  }), []);

  return (
    <div className="course-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="video-container" style={{ position: 'relative' }}>
        {plyrSource ? (
          <div>
            <Plyr source={plyrSource} options={plyrOptions} key={videoInfo.videoId || videoInfo.url} />
            <div className="video-protection-overlay"></div>
          </div>
        ) : (
          <div style={{
            height: '225px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Video unavailable</p>
          </div>
        )}
      </div>

      <div className="course-info" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem' }}>
          <span style={{
            background: '#7c3aed',
            color: '#ffffff',
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '100px',
            fontWeight: 700
          }}>
            Interview Class {index + 1}
          </span>
        </div>

        <h3 className="course-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          {item.title}
        </h3>

        {item.description && (
          <p className="course-desc" style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};

const InterviewClasses = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [interviewClasses, setInterviewClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInterviewData = async () => {
      setLoading(true);
      try {
        const { data } = await getInterviewClasses();
        if (isMounted && data?.success) {
          setInterviewClasses(data.courses || []);
        }
      } catch (err) {
        console.error("Failed to fetch interview classes:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchInterviewData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <header className="full-width-banner-wrapper">
        <div
          className="container"
          style={{
            paddingTop: '3rem',
            paddingBottom: '3rem',
            color: 'white',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <span style={{
              background: 'rgba(124, 58, 237, 0.3)',
              color: '#c4b5fd',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '4px 14px',
              borderRadius: '100px',
              display: 'inline-block',
              marginBottom: '0.75rem',
              border: '1px solid rgba(196, 181, 253, 0.3)'
            }}>
              Aviation Interview Preparation
            </span>

            <h1 style={{ overflow:'hidden' , fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              Interview Classes 
            </h1>

            <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '560px', lineHeight: 1.6 }}>
              Master your airline interview with curated guidance and preparation sessions.
            </p>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        {loading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Loading Interview Classes...</p>
          </div>
        ) : interviewClasses.length > 0 ? (
          <div className="course-grid">
            {interviewClasses.map((item, idx) => (
              <InterviewCard key={item._id} item={item} index={idx} />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#eff6ff',
            padding: '2.5rem',
            borderRadius: '1rem',
            textAlign: 'center',
            border: '1px solid #dbeafe'
          }}>
            <p style={{ fontSize: '1.25rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.5rem' }}>
              No Interview Classes Available
            </p>
            <p style={{ color: '#2563eb' }}>
              Please check back later or contact admin for updates.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default InterviewClasses;
