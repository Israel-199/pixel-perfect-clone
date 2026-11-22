import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Info,
  Layers,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export interface PopupVideoData {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  isActive?: boolean;
  autoPlay?: boolean;
  order?: number;
}

interface PopupVideoWidgetProps {
  /** If provided, renders in preview mode with this data (single or multiple) */
  previewData?: PopupVideoData | null;
  previewVideos?: PopupVideoData[] | null;
  /** If true, runs in isolated preview mode without sessionStorage dismissal */
  isPreview?: boolean;
}

/**
 * Normalizes YouTube or Vimeo links to embed URLs if needed.
 */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&controls=1&modestbranding=1&rel=0`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&controls=1`;
    }
  } catch {
    return null;
  }
  return null;
}

export function PopupVideoWidget({
  previewData,
  previewVideos,
  isPreview = false,
}: PopupVideoWidgetProps) {
  const [videoList, setVideoList] = useState<PopupVideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Sync preview data when in admin preview mode
  useEffect(() => {
    if (previewVideos && previewVideos.length > 0) {
      setVideoList(previewVideos);
      setCurrentIndex((prev) => (prev >= previewVideos.length ? 0 : prev));
      setIsClosed(false);
    } else if (previewData) {
      setVideoList([previewData]);
      setCurrentIndex(0);
      setIsClosed(false);
    }
  }, [previewVideos, previewData]);

  // Fetch active popup videos from backend if not in preview mode
  useEffect(() => {
    if (isPreview || previewData || previewVideos) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("rabbi_popup_video_dismissed");
    if (dismissed === "true") {
      setIsClosed(true);
    }

    let isMounted = true;
    fetchApi<{ videos?: PopupVideoData[]; popup?: PopupVideoData }>("/popup-video", { skipCache: true })
      .then((res) => {
        if (!isMounted) return;
        if (res?.videos && Array.isArray(res.videos) && res.videos.length > 0) {
          const activeVideos = res.videos.filter((v) => v.isActive && v.videoUrl);
          setVideoList(activeVideos);
        } else if (res?.popup && res.popup.isActive && res.popup.videoUrl) {
          setVideoList([res.popup]);
        }
      })
      .catch((err) => {
        console.warn("[PopupVideoWidget] Unable to fetch popup videos:", err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [isPreview, previewData, previewVideos]);

  const currentVideo: PopupVideoData | undefined = videoList[currentIndex];

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (videoList.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? videoList.length - 1 : prev - 1));
    setIsPlaying(false);
    setCurrentTime(0);
  }, [videoList.length]);

  const handleNext = useCallback(() => {
    if (videoList.length <= 1) return;
    setCurrentIndex((prev) => (prev === videoList.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
    setCurrentTime(0);
  }, [videoList.length]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    if (e.changedTouches && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartXRef.current - touchEndX;

      // Swipe left -> Next, Swipe right -> Prev
      if (diff > 50) {
        handleNext();
      } else if (diff < -50) {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Autoplay handler when current video changes
  useEffect(() => {
    if (!currentVideo?.videoUrl || isClosed || isMinimized) return;

    if (currentVideo.autoPlay && videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, [currentVideo?.videoUrl, isClosed, isMinimized, currentIndex]);

  // Auto-advance to next video when current video ends
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoList.length > 1) {
      // Auto advance to next video
      handleNext();
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mute / Unmute toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Minimize
  const handleMinimize = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMinimized(true);
  };

  // Restore from minimize
  const handleRestore = () => {
    setIsMinimized(false);
  };

  // Close / Dismiss
  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsClosed(true);
    if (!isPreview) {
      sessionStorage.setItem("rabbi_popup_video_dismissed", "true");
    }
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Reopen
  const handleReopen = () => {
    setIsClosed(false);
    setIsMinimized(false);
    if (!isPreview) {
      sessionStorage.removeItem("rabbi_popup_video_dismissed");
    }
  };

  // Fullscreen toggle
  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Controls auto-hide on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  // If no active videos available, render nothing
  if (!currentVideo || !currentVideo.videoUrl || (!currentVideo.isActive && !isPreview)) {
    return null;
  }

  const embedUrl = getEmbedUrl(currentVideo.videoUrl);

  // If closed completely, render a small unobtrusive floating launcher so user can reopen anytime
  if (isClosed) {
    if (isPreview) return null;
    return (
      <button
        onClick={handleReopen}
        title={currentVideo.title || "ስለ እኛ ቪዲዮ ይመልከቱ"}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 rounded-full bg-navy-deep/95 border border-gold/40 px-3.5 py-2 text-gold shadow-xl hover:shadow-gold/20 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md cursor-pointer group"
        aria-label="Open description video"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
        </span>
        <Play className="h-3.5 w-3.5 fill-gold text-gold" />
        <span className="text-xs font-semibold tracking-wide font-display text-on-navy group-hover:text-gold transition-colors line-clamp-1 max-w-[130px]">
          {currentVideo.title || "ቪዲዮ"}
        </span>
        {videoList.length > 1 && (
          <span className="text-[10px] bg-gold/20 border border-gold/40 text-gold px-1.5 py-0.2 rounded-full font-bold">
            {videoList.length}
          </span>
        )}
      </button>
    );
  }

  // Minimized state: sleek floating pill badge with pulsing play button
  if (isMinimized) {
    return (
      <div
        className={`${
          isPreview ? "relative mt-4" : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        } animate-in fade-in zoom-in-95 duration-200 select-none max-w-[calc(100vw-32px)]`}
      >
        <div className="flex items-center gap-1.5 p-1.5 bg-navy-deep/95 border border-gold/50 rounded-full shadow-2xl shadow-navy/80 backdrop-blur-lg hover:border-gold transition-all duration-300">
          <button
            onClick={handleRestore}
            className="flex items-center gap-2.5 pl-2.5 pr-2 py-1 cursor-pointer group text-left min-w-0"
            title="ቪዲዮውን ዘርጋ (Expand Video)"
            aria-label="Expand video"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-soft text-navy-deep shadow-md group-hover:scale-110 transition-transform shrink-0">
              <Play className="h-4 w-4 fill-navy-deep ml-0.5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold border border-navy-deep"></span>
              </span>
            </div>

            <div className="flex flex-col pr-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold font-display text-gold tracking-wide leading-tight truncate max-w-[130px] sm:max-w-[180px]">
                  {currentVideo.title || "ስለ እኛ ቪዲዮ"}
                </span>
                {videoList.length > 1 && (
                  <span className="text-[9px] bg-gold/20 text-gold font-bold px-1.5 py-0.2 rounded-full border border-gold/30 shrink-0">
                    {currentIndex + 1}/{videoList.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-on-navy-muted leading-tight truncate max-w-[130px] sm:max-w-[180px]">
                {currentVideo.description || "ቪዲዮውን ለማየት ይጫኑ"}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1 border-l border-gold/20 pl-1 pr-1 shrink-0">
            <button
              onClick={handleRestore}
              className="p-1.5 text-on-navy-muted hover:text-gold rounded-full hover:bg-gold/10 transition-colors cursor-pointer"
              title="ዘርጋ (Expand)"
              aria-label="Expand video popup"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-on-navy-muted hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors cursor-pointer"
              title="ዝጋ (Close)"
              aria-label="Close video popup"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded Full Video Card (Fully Responsive)
  return (
    <div
      className={`${
        isPreview
          ? "relative w-full max-w-[360px] mx-auto"
          : "fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] max-w-[340px] sm:max-w-[360px] md:max-w-[380px]"
      } animate-in fade-in slide-in-from-bottom-5 duration-300 max-h-[92vh] flex flex-col`}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative rounded-2xl overflow-hidden bg-navy-deep/95 border border-gold/40 shadow-2xl shadow-navy-deep/80 backdrop-blur-xl transition-all duration-300 hover:border-gold/70 flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-3.5 py-2.5 bg-gradient-to-r from-navy-deep via-navy to-navy-deep border-b border-gold/20 select-none shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gold/15 text-gold border border-gold/30 shrink-0">
              <Sparkles className="h-3 w-3" />
            </div>
            <h4 className="text-xs font-bold font-display tracking-wider text-gold truncate">
              {currentVideo.title || "About RABBI Digital"}
            </h4>

            {/* Video Counter Badge (if multiple videos) */}
            {videoList.length > 1 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gold/15 text-gold border border-gold/30 shrink-0">
                <Layers className="h-2.5 w-2.5" />
                <span>
                  {currentIndex + 1}/{videoList.length}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-1.5">
            {/* Playlist prev / next buttons */}
            {videoList.length > 1 && (
              <div className="flex items-center gap-0.5 mr-1 bg-navy/80 rounded-md border border-gold/20 p-0.5">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded text-on-navy-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  title="ቀዳሚ ቪዲዮ (Previous Video)"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded text-on-navy-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  title="ቀጣይ ቪዲዮ (Next Video)"
                  aria-label="Next video"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleMinimize}
              className="p-1 sm:p-1.5 rounded-md text-on-navy-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
              title="አሳንስ (Minimize)"
              aria-label="Minimize popup video"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1 sm:p-1.5 rounded-md text-on-navy-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="ዝጋ (Close)"
              aria-label="Close popup video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black/95 overflow-hidden flex items-center justify-center shrink-0">
          {embedUrl ? (
            /* YouTube / Vimeo Embed */
            <iframe
              key={`embed-${currentIndex}-${currentVideo.videoUrl}`}
              src={embedUrl}
              title={currentVideo.title || "Video"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* Native HTML5 Video Player */
            <>
              <video
                ref={videoRef}
                key={`video-${currentIndex}-${currentVideo.videoUrl}`}
                src={currentVideo.videoUrl}
                poster={currentVideo.thumbnailUrl || undefined}
                className="w-full h-full object-cover cursor-pointer"
                playsInline
                preload="metadata"
                onClick={togglePlay}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    setDuration(videoRef.current.duration || 0);
                  }
                }}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Big Center Play Button Overlay (when paused) */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px] cursor-pointer transition-all duration-300"
                >
                  <button
                    className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-gold to-gold-soft text-navy-deep shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200"
                    aria-label="Play video"
                  >
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-navy-deep ml-0.5" />
                    <span className="absolute -inset-1 rounded-full border-2 border-gold/60 animate-ping opacity-40 pointer-events-none" />
                  </button>
                </div>
              )}

              {/* Carousel side arrows over video (if multiple videos) */}
              {videoList.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:text-gold hover:bg-black/80 transition-all opacity-70 hover:opacity-100 cursor-pointer"
                    title="ቀዳሚ ቪዲዮ (Previous)"
                    aria-label="Previous video"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:text-gold hover:bg-black/80 transition-all opacity-70 hover:opacity-100 cursor-pointer"
                    title="ቀጣይ ቪዲዮ (Next)"
                    aria-label="Next video"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Video Controls Bar */}
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 sm:p-2.5 transition-opacity duration-300 ${
                  showControls || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                {/* Scrub Progress Bar */}
                <div
                  className="w-full h-1 bg-white/20 rounded-full mb-1.5 cursor-pointer relative overflow-hidden group/scrub"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    if (videoRef.current && duration) {
                      videoRef.current.currentTime = pos * duration;
                    }
                  }}
                >
                  <div
                    className="h-full bg-gold transition-all duration-100"
                    style={{
                      width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-white text-[11px]">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="p-1 hover:text-gold transition-colors cursor-pointer"
                      title={isPlaying ? "አቁም (Pause)" : "አጫውት (Play)"}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1 hover:text-gold transition-colors cursor-pointer"
                      title={isMuted ? "ድምፅ ክፈት (Unmute)" : "ድምፅ አጥፋ (Mute)"}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-3.5 w-3.5 text-gold/80" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Time display */}
                    <span className="text-[10px] font-mono text-white/70">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleFullscreen}
                      className="p-1 hover:text-gold transition-colors cursor-pointer"
                      title="ሙሉ ስክሪን (Fullscreen)"
                      aria-label="Fullscreen"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dots Indicator for Multiple Videos */}
        {videoList.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 bg-navy-deep border-t border-gold/10">
            {videoList.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "w-4 h-1.5 bg-gold"
                    : "w-1.5 h-1.5 bg-gold/30 hover:bg-gold/60"
                }`}
                title={`ቪዲዮ ${idx + 1}`}
                aria-label={`Go to video ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Content Area: One-line Video Description & Action */}
        <div className="p-2.5 sm:p-3 bg-navy-deep/95 border-t border-gold/15">
          {/* One-Line Description with Tooltip */}
          <div className="flex items-start gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
            <p
              className="text-xs text-on-navy font-body leading-relaxed line-clamp-1 truncate select-text cursor-default"
              title={currentVideo.description}
            >
              {currentVideo.description || "የእኛን ዲጂታል መድረክ አጭር ማብራሪያ ይመልከቱ"}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {currentVideo.ctaLink ? (
              currentVideo.ctaLink.startsWith("http") ? (
                <a
                  href={currentVideo.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold font-display px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold to-gold-soft text-navy-deep hover:shadow-lg hover:shadow-gold/20 hover:brightness-105 active:scale-95 transition-all w-full justify-center"
                >
                  <span className="truncate">{currentVideo.ctaText || "ስለ እኛ ተጨማሪ እወቅ"}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <Link
                  to={currentVideo.ctaLink}
                  onClick={() => {
                    if (!isPreview) handleMinimize();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold font-display px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold to-gold-soft text-navy-deep hover:shadow-lg hover:shadow-gold/20 hover:brightness-105 active:scale-95 transition-all w-full justify-center"
                >
                  <span className="truncate">{currentVideo.ctaText || "ስለ እኛ ተጨማሪ እወቅ"}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </Link>
              )
            ) : (
              <button
                onClick={handleMinimize}
                className="inline-flex items-center gap-1.5 text-xs font-semibold font-display px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-all w-full justify-center cursor-pointer"
              >
                <span>ቪዲዮውን አሳንስ (Minimize)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
