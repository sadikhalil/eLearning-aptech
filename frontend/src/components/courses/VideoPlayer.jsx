import { useRef, useState, useEffect, useCallback } from "react";
import { progressApi } from "../../api/progressApi";
import "./VideoPlayer.css";

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const VideoPlayer = ({ lessonId, videoUrl, initialProgress = 0, onComplete }) => {
  const videoRef     = useRef(null);
  const intervalRef  = useRef(null);
  const [playing,   setPlaying]   = useState(false);
  const [current,   setCurrent]   = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [volume,    setVolume]    = useState(1);
  const [muted,     setMuted]     = useState(false);
  const [fullscr,   setFullscr]   = useState(false);
  const [buffered,  setBuffered]  = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showCtrl,  setShowCtrl]  = useState(true);
  const hideTimer   = useRef(null);

  /* ── Resume from last position ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const resumeAt = (initialProgress / 100) * duration;
    if (resumeAt > 10) v.currentTime = resumeAt;
  }, [duration, initialProgress]);

  /* ── Report progress to backend every 10s ── */
  const reportProgress = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !lessonId) return;
    const pct = duration > 0 ? (v.currentTime / duration) * 100 : 0;
    try {
      await progressApi.update(lessonId, {
        watched_percent:    parseFloat(pct.toFixed(1)),
        watch_time_seconds: Math.floor(v.currentTime),
      });
      if (pct >= 90 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    } catch (_) {}
  }, [lessonId, duration, completed, onComplete]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(reportProgress, 10000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, reportProgress]);

  /* ── Video events ── */
  const onLoadedMeta = () => setDuration(videoRef.current?.duration || 0);
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime);
    if (v.buffered.length > 0)
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
  };
  const onEnded = () => { setPlaying(false); reportProgress(); };

  /* ── Controls ── */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else         { v.play(); setPlaying(true); }
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) videoRef.current.currentTime = pct * duration;
  };

  const changeVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    setMuted(p => {
      if (videoRef.current) videoRef.current.muted = !p;
      return !p;
    });
  };

  const toggleFullscreen = () => {
    const wrap = videoRef.current?.parentElement;
    if (!document.fullscreenElement) {
      wrap?.requestFullscreen();
      setFullscr(true);
    } else {
      document.exitFullscreen();
      setFullscr(false);
    }
  };

  const showControls = () => {
    setShowCtrl(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowCtrl(false), 3000);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={`vp-wrap ${fullscr ? "vp-fullscreen" : ""}`}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setShowCtrl(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="vp-video"
        onClick={togglePlay}
        onLoadedMetadata={onLoadedMeta}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Completed overlay */}
      {completed && (
        <div className="vp-complete-badge">✅ Lesson complete!</div>
      )}

      {/* Controls overlay */}
      <div className={`vp-controls ${showCtrl ? "visible" : ""}`}>
        {/* Progress bar */}
        <div className="vp-bar-wrap" onClick={seek}>
          <div className="vp-bar-bg">
            <div className="vp-bar-buffered" style={{ width: `${buffered}%` }} />
            <div className="vp-bar-fill"     style={{ width: `${pct}%` }} />
            <div className="vp-bar-thumb"    style={{ left: `${pct}%` }} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="vp-bottom">
          <div className="vp-left">
            <button className="vp-btn" onClick={togglePlay} title={playing ? "Pause" : "Play"}>
              {playing ? "⏸" : "▶"}
            </button>
            <div className="vp-vol">
              <button className="vp-btn" onClick={toggleMute}>
                {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={changeVolume}
                className="vp-vol-slider"
              />
            </div>
            <span className="vp-time">{fmt(current)} / {fmt(duration)}</span>
          </div>
          <div className="vp-right">
            <button className="vp-btn" onClick={toggleFullscreen} title="Fullscreen">
              {fullscr ? "⛶" : "⛶"}
            </button>
          </div>
        </div>
      </div>

      {/* Big play button when paused */}
      {!playing && (
        <button className="vp-big-play" onClick={togglePlay}>▶</button>
      )}
    </div>
  );
};

export default VideoPlayer;
